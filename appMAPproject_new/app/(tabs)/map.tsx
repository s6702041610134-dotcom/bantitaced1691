import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

// Sub-services and components
import { OYSTER_BAY_MAP_STYLE } from '../constants/MapStyle';
import { fetchOSRMRoute, Coordinate } from '../services/routing';
import { searchPlaces, reverseGeocode, SearchResult } from '../services/geocoding';
import ReceiptModal from '../components/ReceiptModal';

type PlaceItem = {
  id: string;
  name: string;
  coordinate: Coordinate;
  isPendingGeocode?: boolean;
};

// Preset popular Thailand locations for 1-tap selection
const POPULAR_PRESETS = [
  { name: 'ตึก 44 มจพ.', lat: 13.8184, lon: 100.5144 },
  { name: 'อารีย์ (Ari)', lat: 13.7797, lon: 100.5447 },
  { name: 'สยามพารากอน', lat: 13.7460, lon: 100.5348 },
  { name: 'ICONSIAM', lat: 13.7267, lon: 100.5108 },
  { name: 'วัดพระแก้ว', lat: 13.7516, lon: 100.4927 },
  { name: 'ตลาดจตุจักร', lat: 13.8034, lon: 100.5501 },
];

export default function MapScreen() {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Navigation Route & Distance States
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [totalDistance, setTotalDistance] = useState<number | null>(0);
  const [isRouting, setIsRouting] = useState(false);

  // Receipt Modal & Snapshot States
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [mapSnapshotUri, setMapSnapshotUri] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [journeyDate, setJourneyDate] = useState<Date>(new Date());

  const mapRef = useRef<MapView | null>(null);

  // --- 1. Debounced Route API Computation with AbortController ---
  useEffect(() => {
    if (places.length < 2) {
      setRouteCoordinates([]);
      setTotalDistance(0);
      setIsRouting(false);
      return;
    }

    const controller = new AbortController();
    setIsRouting(true);

    const timer = setTimeout(async () => {
      try {
        const coords = places.map((p) => p.coordinate);
        const result = await fetchOSRMRoute(coords, controller.signal);
        setRouteCoordinates(result.coordinates);
        setTotalDistance(result.distanceKm);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.log('Route calculation error:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsRouting(false);
        }
      }
    }, 600); // 600ms debounce to prevent API spam when adding points quickly

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [places]);

  // --- 2. Debounced Search API (Nominatim + Photon Deduplicated) ---
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery, controller.signal);
        setSearchResults(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.log('Search error:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // --- 3. Handle Direct Map Tap (Reverse Geocoding with Loading State) ---
  const handleMapPress = async (e: any) => {
    if (receiptVisible) return;
    if (showDropdown) {
      setShowDropdown(false);
      Keyboard.dismiss();
      return;
    }

    const coord: Coordinate = e.nativeEvent.coordinate;
    const newId = Crypto.randomUUID();

    // Add pending place item first
    const pendingPlace: PlaceItem = {
      id: newId,
      name: '📍 กำลังระบุสถานที่...',
      coordinate: coord,
      isPendingGeocode: true,
    };
    setPlaces((prev) => [...prev, pendingPlace]);

    // Reverse Geocode name in background
    const realName = await reverseGeocode(coord.latitude, coord.longitude);
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === newId
          ? { ...p, name: realName, isPendingGeocode: false }
          : p
      )
    );
  };

  // --- 4. Select Search Item or Preset Chip ---
  const selectSearchResult = (item: SearchResult) => {
    const shortName = item.display_name.split(',')[0];
    const newPlace: PlaceItem = {
      id: Crypto.randomUUID(),
      name: shortName,
      coordinate: { latitude: item.lat, longitude: item.lon },
    };

    setPlaces((prev) => [...prev, newPlace]);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    Keyboard.dismiss();

    mapRef.current?.animateToRegion(
      {
        latitude: item.lat,
        longitude: item.lon,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      1000
    );
  };

  const addPresetPlace = (preset: { name: string; lat: number; lon: number }) => {
    const newPlace: PlaceItem = {
      id: Crypto.randomUUID(),
      name: preset.name,
      coordinate: { latitude: preset.lat, longitude: preset.lon },
    };

    setPlaces((prev) => [...prev, newPlace]);
    setShowDropdown(false);

    mapRef.current?.animateToRegion(
      {
        latitude: preset.lat,
        longitude: preset.lon,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      1000
    );
  };

  const removePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  // --- 5. Finish Journey & Open Thermal Receipt Modal ---
  const finishJourney = async () => {
    if (places.length === 0) {
      Alert.alert('ยังไม่มีสถานที่', 'โปรดแตะเลือกหรือค้นหาสถานที่บนแผนที่ก่อนครับ');
      return;
    }

    // 1. Generate receipt number & date snapshot ONCE on trigger
    const newReceiptNo = `TRP-${Math.floor(1000 + Math.random() * 9000)}`;
    setReceiptNumber(newReceiptNo);
    setJourneyDate(new Date());

    // 2. Fit map to coordinates so all markers & polylines are visible
    if (mapRef.current && places.length > 0) {
      mapRef.current.fitToCoordinates(
        places.map((p) => p.coordinate),
        {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: false,
        }
      );
    }

    // 3. Short pause for map view tiles to render fitted bounds
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 4. Capture native map snapshot
    let snapshotUri: string | null = null;

    try {
      if (mapRef.current) {
        const snapshot = await mapRef.current.takeSnapshot({
          width: 600,
          height: 320,
          format: 'png',
          quality: 0.9,
          result: 'file',
        });
        if (snapshot) {
          snapshotUri = snapshot.startsWith('file://') || snapshot.startsWith('data:')
            ? snapshot
            : `file://${snapshot}`;
        }
      }
    } catch (err) {
      console.log('File snapshot error, trying base64:', err);
      try {
        if (mapRef.current) {
          const b64 = await mapRef.current.takeSnapshot({
            width: 600,
            height: 320,
            format: 'png',
            quality: 0.9,
            result: 'base64',
          });
          if (b64) {
            snapshotUri = `data:image/png;base64,${b64.replace(/\s/g, '')}`;
          }
        }
      } catch (b64Err) {
        console.log('Base64 snapshot error:', b64Err);
      }
    }

    // Fallback static map if native snapshot was unavailable
    if (!snapshotUri && places.length > 0) {
      const avgLat = places.reduce((sum, p) => sum + p.coordinate.latitude, 0) / places.length;
      const avgLon = places.reduce((sum, p) => sum + p.coordinate.longitude, 0) / places.length;
      const markersParam = places.map((p) => `${p.coordinate.latitude},${p.coordinate.longitude},ol-marker`).join('|');
      snapshotUri = `https://staticmap.openstreetmap.de/staticmap.php?center=${avgLat.toFixed(4)},${avgLon.toFixed(4)}&zoom=13&size=600x300&maptype=mapnik&markers=${markersParam}`;
    }

    setMapSnapshotUri(snapshotUri);
    setReceiptVisible(true);
  };

  const closeReceipt = () => {
    setReceiptVisible(false);
    setMapSnapshotUri(null); // Reset snapshot to prevent stale image reuse
  };

  return (
    <View style={styles.container}>
      {/* Interactive Map View (Apple Maps on iOS, Google Maps on Android) */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        onPress={handleMapPress}
        customMapStyle={OYSTER_BAY_MAP_STYLE}
        initialRegion={{
          latitude: 13.7563,
          longitude: 100.5018,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {places.map((p, i) => (
          <Marker key={p.id} coordinate={p.coordinate}>
            <View style={styles.markerContainer}>
              <View style={styles.markerPin} />
              <View style={styles.markerLabel}>
                <Text style={styles.markerText}>{(i + 1).toString().padStart(2, '0')}</Text>
              </View>
            </View>
          </Marker>
        ))}

        {/* Real Road Navigation Polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Colors.freshlyRoasted}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Top Search Bar & Preset Chips */}
      <SafeAreaView style={styles.overlayTop} pointerEvents="box-none">
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="rgba(75, 46, 31, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="พิมพ์ชื่อสถานที่ (เช่น ตึก44 มจพ, สยาม...)"
              placeholderTextColor="rgba(75, 46, 31, 0.4)"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={Colors.freshlyRoasted} />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={18} color="rgba(75, 46, 31, 0.6)" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Quick Preset Location Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.presetScroll}
            contentContainerStyle={styles.presetContainer}
          >
            {POPULAR_PRESETS.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetChip}
                onPress={() => addPresetPlace(preset)}
                activeOpacity={0.8}
              >
                <Feather name="plus-circle" size={12} color={Colors.freshlyRoasted} />
                <Text style={styles.presetChipText}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Live Search Dropdown (Scrollable with nestedScrollEnabled for smooth scrolling) */}
          {showDropdown && searchResults.length > 0 && (
            <ScrollView
              style={styles.dropdown}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={styles.dropdownItem}
                  onPress={() => selectSearchResult(item)}
                >
                  <Feather name="map-pin" size={16} color={Colors.freshlyRoasted} style={{ marginRight: 10 }} />
                  <Text style={styles.dropdownText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      {/* Bottom Panel */}
      <View style={styles.panelBottom}>
        <View style={styles.panelHandle} />
        <View style={styles.panelHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.statVal}>
                {places.length < 2
                  ? '0.0 km'
                  : totalDistance !== null
                  ? `${totalDistance.toFixed(1)} km`
                  : 'Distance N/A'}
              </Text>
              {isRouting && <ActivityIndicator size="small" color={Colors.freshlyRoasted} style={{ marginLeft: 6 }} />}
            </View>
            <Text style={styles.statLbl}>
              {places.length === 1 ? 'เพิ่มอีก 1 จุดเพื่อลากเส้นทาง' : 'Road Distance'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statVal}>{places.length}</Text>
            <Text style={styles.statLbl}>Places Visited</Text>
          </View>
        </View>

        <ScrollView style={styles.timeline}>
          {places.length === 0 ? (
            <Text style={styles.emptyText}>ค้นหาหรือแตะบนแผนที่เพื่อระบุสถานที่จริง</Text>
          ) : (
            places.map((p, i) => (
              <View key={p.id} style={styles.tlItem}>
                {i !== places.length - 1 && <View style={styles.tlLine} />}
                <View style={styles.tlNum}>
                  <Text style={styles.tlNumText}>{(i + 1).toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.tlContent}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.tlName}>📍 {p.name}</Text>
                      {p.isPendingGeocode && <ActivityIndicator size="small" color={Colors.freshlyRoasted} />}
                    </View>
                    <Text style={styles.tlDist}>Added to journey</Text>
                  </View>
                  <TouchableOpacity onPress={() => removePlace(p.id)} style={{ padding: 4 }}>
                    <Feather name="x" size={16} color="rgba(75, 46, 31, 0.4)" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.finishWrap}>
          <TouchableOpacity style={styles.btnPrimary} onPress={finishJourney} activeOpacity={0.8}>
            <Text style={styles.btnText}>✓ Finish Journey</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Thermal Printer Receipt Modal */}
      <ReceiptModal
        visible={receiptVisible}
        places={places}
        totalDistance={places.length < 2 ? 0 : totalDistance}
        mapSnapshotUri={mapSnapshotUri}
        receiptNumber={receiptNumber}
        journeyDate={journeyDate}
        onClose={closeReceipt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, zIndex: 10 },
  searchContainer: { marginTop: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.oldLace,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: Colors.freshlyRoasted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.freshlyRoasted,
  },
  presetScroll: { marginTop: 8 },
  presetContainer: { gap: 8 },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.butter,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  presetChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.freshlyRoasted,
  },
  dropdown: {
    backgroundColor: Colors.oldLace,
    borderRadius: 16,
    marginTop: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    maxHeight: 220,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.freshlyRoasted,
    flex: 1,
  },

  markerContainer: { alignItems: 'center' },
  markerPin: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.freshlyRoasted, marginBottom: 2 },
  markerLabel: { backgroundColor: Colors.butter, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  markerText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.freshlyRoasted },

  panelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.oldLace,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: Colors.freshlyRoasted,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    maxHeight: '50%',
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderLightStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  statVal: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: Colors.freshlyRoasted },
  statLbl: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(75, 46, 31, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeline: { paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', fontFamily: 'Inter_400Regular', color: 'rgba(75, 46, 31, 0.6)', marginTop: 20 },
  tlItem: { flexDirection: 'row', marginBottom: 16, position: 'relative' },
  tlLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -20,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.borderLightStrong,
  },
  tlNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.butter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  tlNumText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.freshlyRoasted },
  tlContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    padding: 12,
  },
  tlName: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.freshlyRoasted },
  tlDist: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(75, 46, 31, 0.6)' },
  finishWrap: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },

  btnPrimary: {
    backgroundColor: Colors.freshlyRoasted,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
  },
  btnText: { color: Colors.oldLace, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
