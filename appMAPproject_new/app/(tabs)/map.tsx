import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Crypto from 'expo-crypto';

export type Place = {
  id: string;
  name: string;
  isGeocoding?: boolean;
  coordinate: { latitude: number; longitude: number };
};

export type SearchResult = {
  place_id: string | number;
  display_name: string;
  lat: string | number;
  lon: string | number;
};

// Preset popular Thailand places for 1-tap selection
const POPULAR_PRESETS = [
  { name: 'ตึก 44 มจพ.', lat: 13.8184, lon: 100.5144 },
  { name: 'อารีย์ (Ari)', lat: 13.7797, lon: 100.5447 },
  { name: 'สยามพารากอน', lat: 13.7460, lon: 100.5348 },
  { name: 'ICONSIAM', lat: 13.7267, lon: 100.5108 },
  { name: 'วัดพระแก้ว', lat: 13.7516, lon: 100.4927 },
  { name: 'ตลาดจตุจักร', lat: 13.8034, lon: 100.5501 },
];

// Helper: Haversine formula for honest straight-line fallback distance
function calculateHaversineDistance(
  coords: { latitude: number; longitude: number }[]
): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const R = 6371; // Earth's radius in km
    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.latitude * Math.PI) / 180) *
        Math.cos((p2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return total;
}

export default function MapScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mapSnapshotUri, setMapSnapshotUri] = useState<string | null>(null);

  // Receipt Fixed Snapshot Data (Prevents random values during re-renders)
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<Date | null>(null);

  // Real road route coordinates & status
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [isRouting, setIsRouting] = useState(false);

  const mapRef = useRef<MapView | null>(null);
  const receiptRef = useRef<View | null>(null);
  const routeAbortControllerRef = useRef<AbortController | null>(null);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reanimated values
  const receiptHeight = useSharedValue(0);
  const receiptOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);
  const actionsTranslateY = useSharedValue(20);

  // Clean up timers & abort controllers on unmount
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (routeAbortControllerRef.current) routeAbortControllerRef.current.abort();
    };
  }, []);

  // Fetch real road navigation route using OSRM API (with Debounce & AbortController)
  useEffect(() => {
    if (places.length < 2) {
      setRouteCoordinates([]);
      setTotalDistance(0);
      setIsRouting(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Abort any pending route request
      if (routeAbortControllerRef.current) {
        routeAbortControllerRef.current.abort();
      }

      const controller = new AbortController();
      routeAbortControllerRef.current = controller;

      setIsRouting(true);
      try {
        const coordsString = places
          .map((p) => `${p.coordinate.longitude},${p.coordinate.latitude}`)
          .join(';');

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const decodedCoords = route.geometry.coordinates.map(
            ([lon, lat]: [number, number]) => ({
              latitude: lat,
              longitude: lon,
            })
          );
          setRouteCoordinates(decodedCoords);
          setTotalDistance(route.distance / 1000); // meters to km
        } else {
          // Fallback to honest Haversine straight-line distance
          const points = places.map((p) => p.coordinate);
          setRouteCoordinates(points);
          setTotalDistance(calculateHaversineDistance(points));
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.log('OSRM routing error:', error);
          const points = places.map((p) => p.coordinate);
          setRouteCoordinates(points);
          setTotalDistance(calculateHaversineDistance(points));
        }
      } finally {
        if (routeAbortControllerRef.current === controller) {
          setIsRouting(false);
        }
      }
    }, 500); // 500ms debounce to prevent API spamming

    return () => {
      clearTimeout(timer);
      if (routeAbortControllerRef.current) {
        routeAbortControllerRef.current.abort();
      }
    };
  }, [places]);

  // Dual Geocoding Search with Deduplication (Nominatim + Photon API)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Query 1: OpenStreetMap Nominatim with Thailand focus
        const nominatimPromise = fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5&accept-language=th,en&countrycodes=th`
        )
          .then((r) => r.json())
          .catch(() => []);

        // Query 2: Photon API (Fast fuzzy matching around Thailand coordinates)
        const photonPromise = fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(
            searchQuery
          )}&limit=5&lat=13.7563&lon=100.5018`
        )
          .then((r) => r.json())
          .then((data) => {
            if (!data || !data.features) return [];
            return data.features.map((f: any, idx: number) => ({
              place_id: `photon-${idx}-${Crypto.randomUUID()}`,
              display_name: [
                f.properties.name,
                f.properties.street,
                f.properties.district,
                f.properties.city,
                f.properties.country,
              ]
                .filter(Boolean)
                .join(', '),
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
            }));
          })
          .catch(() => []);

        const [nomResults, photonResults] = await Promise.all([
          nominatimPromise,
          photonPromise,
        ]);

        // Combine & deduplicate search results by coordinates
        const combined = [
          ...(Array.isArray(nomResults) ? nomResults : []),
          ...photonResults,
        ];
        const uniqueResults: SearchResult[] = [];
        const seenKeys = new Set<string>();

        for (const item of combined) {
          const latNum =
            typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
          const lonNum =
            typeof item.lon === 'string' ? parseFloat(item.lon) : item.lon;
          const key = `${latNum.toFixed(4)},${lonNum.toFixed(4)}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueResults.push(item);
          }
        }

        setSearchResults(uniqueResults.slice(0, 7));
      } catch (error) {
        console.log('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle direct tap on map with REVERSE GEOCODING (Real Place Name Lookup)
  const handleMapPress = async (e: any) => {
    if (receiptVisible) return;
    if (showDropdown) {
      setShowDropdown(false);
      Keyboard.dismiss();
      return;
    }
    const coord = e.nativeEvent.coordinate;
    const placeId = Crypto.randomUUID();

    // Add temp place marker with loading indicator state
    const tempPlace: Place = {
      id: placeId,
      name: '📍 กำลังระบุสถานที่...',
      isGeocoding: true,
      coordinate: coord,
    };
    setPlaces((prev) => [...prev, tempPlace]);

    // Perform Reverse Geocoding to get real place/street name in Thai
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord.latitude}&lon=${coord.longitude}&accept-language=th,en`
      );
      const data = await response.json();

      let realName = '';
      if (data && data.address) {
        realName =
          data.address.amenity ||
          data.address.building ||
          data.address.shop ||
          data.address.tourism ||
          data.address.leisure ||
          data.address.office ||
          data.address.road ||
          data.address.suburb ||
          data.address.quarter ||
          (data.display_name ? data.display_name.split(',')[0] : '');
      } else if (data && data.display_name) {
        realName = data.display_name.split(',')[0];
      }

      if (!realName || realName.trim().length === 0) {
        realName = `พิกัด (${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)})`;
      }

      // Update place with resolved reverse geocoded name
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === placeId ? { ...p, name: realName, isGeocoding: false } : p
        )
      );
    } catch (err) {
      console.log('Reverse geocoding error:', err);
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === placeId
            ? {
                ...p,
                name: `จุดปักหมุด (${coord.latitude.toFixed(
                  3
                )}, ${coord.longitude.toFixed(3)})`,
                isGeocoding: false,
              }
            : p
        )
      );
    }
  };

  const selectSearchResult = (item: SearchResult) => {
    const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
    const lon = typeof item.lon === 'string' ? parseFloat(item.lon) : item.lon;
    const shortName = item.display_name.split(',')[0];

    const newPlace: Place = {
      id: Crypto.randomUUID(),
      name: shortName,
      isGeocoding: false,
      coordinate: { latitude: lat, longitude: lon },
    };

    setPlaces((prev) => [...prev, newPlace]);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    Keyboard.dismiss();

    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      1000
    );
  };

  const addPresetPlace = (preset: { name: string; lat: number; lon: number }) => {
    const newPlace: Place = {
      id: Crypto.randomUUID(),
      name: preset.name,
      isGeocoding: false,
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
    setPlaces(places.filter((p) => p.id !== id));
  };

  const finishJourney = async () => {
    if (places.length === 0) {
      Alert.alert('ยังไม่มีสถานที่', 'โปรดแตะเลือกหรือค้นหาสถานที่บนแผนที่ก่อนครับ');
      return;
    }

    // Set fixed receipt number and timestamp snapshot for this specific receipt session
    setReceiptNumber(`TRP-${Math.floor(100000 + Math.random() * 900000)}`);
    setReceiptDate(new Date());

    // 1. Fit map to display all visited places and routes
    if (mapRef.current && places.length > 0) {
      mapRef.current.fitToCoordinates(
        places.map((p) => p.coordinate),
        {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: false,
        }
      );
    }

    // 2. Short pause to allow map view to finish rendering fitted bounds
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 3. Calculate fallback static map URL (OSM Static Map Service)
    const avgLat =
      places.reduce((sum, p) => sum + p.coordinate.latitude, 0) / places.length;
    const avgLon =
      places.reduce((sum, p) => sum + p.coordinate.longitude, 0) / places.length;
    const markersParam = places
      .map((p) => `${p.coordinate.latitude},${p.coordinate.longitude},ol-marker`)
      .join('|');
    const fallbackStaticUri = `https://staticmap.openstreetmap.de/staticmap.php?center=${avgLat.toFixed(
      4
    )},${avgLon.toFixed(4)}&zoom=13&size=600x300&maptype=mapnik&markers=${markersParam}`;

    let capturedUri: string | null = null;

    // 4. Capture native map snapshot
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
          capturedUri =
            snapshot.startsWith('file://') || snapshot.startsWith('data:')
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
            const cleanB64 = b64.replace(/\s/g, '');
            capturedUri = `data:image/png;base64,${cleanB64}`;
          }
        }
      } catch (b64Err) {
        console.log('Base64 snapshot error:', b64Err);
      }
    }

    // Set snapshot URI (or fallback static map if snapshot failed)
    setMapSnapshotUri(capturedUri || fallbackStaticUri);
    setReceiptVisible(true);

    // Animate Modal background
    receiptOpacity.value = withTiming(1, { duration: 300 });

    // Animate receipt printing down smoothly in 1.6s
    receiptHeight.value = withTiming(540, {
      duration: 1600,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => {
      actionsOpacity.value = withTiming(1, { duration: 400 });
      actionsTranslateY.value = withSpring(0);
    }, 1600);
  };

  const closeReceipt = () => {
    receiptOpacity.value = withTiming(0, { duration: 250 });
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);

    setTimeout(() => {
      setReceiptVisible(false);
      setMapSnapshotUri(null); // Clean up snapshot for fresh session
      receiptHeight.value = 0;
      actionsOpacity.value = 0;
      actionsTranslateY.value = 20;
    }, 250);
  };

  const printAndSaveReceipt = async () => {
    try {
      if (!receiptRef.current) {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบการแสดงผลใบเสร็จ');
        return;
      }

      // Short delay to ensure all nested images in receipt view have finished rendering
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Capture receipt View shot as PNG
      const uri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // Save to photo library if available
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
        }
      } catch (err) {
        console.log('MediaLibrary error:', err);
      }

      // Open native share dialog
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'บันทึกภาพใบเสร็จการเดินทาง',
          mimeType: 'image/png',
          UTI: 'public.png',
        });
      } else {
        Alert.alert('สำเร็จ', 'บันทึกรูปภาพใบเสร็จเรียบร้อยแล้ว!');
      }
    } catch (error) {
      console.log('Print error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกหรือพิมพ์ใบเสร็จได้ โปรดลองอีกครั้ง');
    }
  };

  const receiptAnimatedStyle = useAnimatedStyle(() => ({
    height: receiptHeight.value,
  }));
  const modalBackgroundStyle = useAnimatedStyle(() => ({
    opacity: receiptOpacity.value,
  }));
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
    transform: [{ translateY: actionsTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        onPress={handleMapPress}
        customMapStyle={oysterBayMapStyle}
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
                <Text style={styles.markerText}>
                  {(i + 1).toString().padStart(2, '0')}
                </Text>
              </View>
            </View>
          </Marker>
        ))}

        {/* Real road polyline navigation */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Colors.freshlyRoasted}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Top Search Bar & Preset Chips Overlay */}
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

          {/* Live Search Dropdown Results */}
          {showDropdown && searchResults.length > 0 && (
            <View style={styles.dropdown}>
              {searchResults.map((item, idx) => (
                <TouchableOpacity
                  key={item.place_id || idx}
                  style={styles.dropdownItem}
                  onPress={() => selectSearchResult(item)}
                >
                  <Feather
                    name="map-pin"
                    size={16}
                    color={Colors.freshlyRoasted}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.dropdownText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Bottom Panel */}
      <View style={styles.panelBottom}>
        <View style={styles.panelHandle} />
        <View style={styles.panelHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.statVal}>{totalDistance.toFixed(1)} km</Text>
              {isRouting && (
                <ActivityIndicator
                  size="small"
                  color={Colors.freshlyRoasted}
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>
            <Text style={styles.statLbl}>
              {places.length < 2 ? '0.0 km (เพิ่มอีก 1 จุดเพื่อสร้างเส้นทาง)' : 'Road Distance'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statVal}>{places.length}</Text>
            <Text style={styles.statLbl}>Places Visited</Text>
          </View>
        </View>

        <ScrollView style={styles.timeline}>
          {places.length === 0 ? (
            <Text style={styles.emptyText}>
              ค้นหาหรือแตะบนแผนที่เพื่อระบุสถานที่จริง
            </Text>
          ) : (
            places.map((p, i) => (
              <View key={p.id} style={styles.tlItem}>
                {i !== places.length - 1 && <View style={styles.tlLine} />}
                <View style={styles.tlNum}>
                  <Text style={styles.tlNumText}>
                    {(i + 1).toString().padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.tlContent}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.tlName}>📍 {p.name}</Text>
                      {p.isGeocoding && (
                        <ActivityIndicator size="small" color={Colors.freshlyRoasted} />
                      )}
                    </View>
                    <Text style={styles.tlDist}>
                      {p.isGeocoding ? 'กำลังระบุชื่อสถานที่...' : 'Added just now'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removePlace(p.id)}
                    style={{ padding: 4 }}
                  >
                    <Feather name="x" size={16} color="rgba(75, 46, 31, 0.4)" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        <View style={styles.finishWrap}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={finishJourney}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>✓ Finish Journey</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Thermal Printer Modal */}
      {receiptVisible && (
        <Animated.View style={[styles.receiptModal, modalBackgroundStyle]}>
          <View style={styles.printerSlot} />

          <Animated.View style={[styles.receiptPaper, receiptAnimatedStyle]}>
            {/* ViewShot Container (Captured as clean PNG) */}
            <View ref={receiptRef} collapsable={false} style={styles.receiptPrintArea}>
              <View style={styles.rHead}>
                <Text style={styles.rTitle}>TRAVEL RECEIPT</Text>
                <Text style={styles.rMeta}>
                  {(receiptDate || new Date()).toLocaleDateString('th-TH')} •{' '}
                  {(receiptDate || new Date()).toLocaleTimeString('th-TH')} •{' '}
                  {receiptNumber}
                </Text>
              </View>

              <View style={styles.rBody}>
                {places.map((p, i) => (
                  <View key={p.id} style={styles.rRow}>
                    <Text style={styles.rRowText}>
                      {i + 1}. {p.name}
                    </Text>
                  </View>
                ))}

                {/* Map Preview Image inside Receipt */}
                <View style={styles.rMiniMapWrap}>
                  {mapSnapshotUri ? (
                    <Image
                      source={{ uri: mapSnapshotUri }}
                      style={styles.rMiniMapImage}
                      resizeMode="cover"
                      fadeDuration={0}
                    />
                  ) : (
                    <View style={styles.rMiniMapPlaceholder}>
                      <ActivityIndicator size="small" color={Colors.freshlyRoasted} />
                      <Text style={styles.rMiniMapPlaceholderText}>
                        Route Map Preview
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.rRow, { marginTop: 15 }]}>
                  <Text style={styles.rRowTextBold}>TOTAL DISTANCE</Text>
                  <Text style={styles.rRowTextBold}>{totalDistance.toFixed(1)} km</Text>
                </View>
                <View style={styles.rRow}>
                  <Text style={styles.rRowTextBold}>PLACES VISITED</Text>
                  <Text style={styles.rRowTextBold}>{places.length}</Text>
                </View>
              </View>

              <View style={styles.rFoot}>
                <Text style={styles.rFootText}>TRIP COMPLETED ✓</Text>
                <Text style={[styles.rFootText, { marginTop: 6 }]}>
                  "Every journey becomes a memory."
                </Text>
              </View>
            </View>

            <View style={styles.zigZag} />
          </Animated.View>

          <Animated.View style={[styles.receiptActions, actionsStyle]}>
            <TouchableOpacity style={styles.btnSecondary} onPress={closeReceipt}>
              <Text style={styles.btnTextDark}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={printAndSaveReceipt}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>🖨 Print & Save</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

// Warm Editorial Oyster Bay Map Style
const oysterBayMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#FAF8F5' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4B2E1F' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FAF8F5' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E5DEC9' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#F3EFE6' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#EDE7D9' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#EAE4DC' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#F4EBD9' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#C2D3DA' }],
  },
];

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
  statLbl: { fontFamily: 'Inter_500Medium', fontSize: 11, color: 'rgba(75, 46, 31, 0.6)', textTransform: 'uppercase', letterSpacing: 0.5 },
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

  btnPrimary: { backgroundColor: Colors.freshlyRoasted, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999, alignItems: 'center' },
  btnSecondary: { backgroundColor: Colors.butter, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999, alignItems: 'center' },
  btnText: { color: Colors.oldLace, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  btnTextDark: { color: Colors.freshlyRoasted, fontFamily: 'Inter_600SemiBold', fontSize: 14 },

  receiptModal: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(75,46,31,0.8)',
    zIndex: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  printerSlot: {
    width: 320,
    height: 30,
    backgroundColor: '#2A1A11',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    zIndex: 10,
    marginBottom: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  receiptPaper: { width: 290, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 40 },
  receiptPrintArea: { backgroundColor: '#fff', paddingHorizontal: 20 },
  rHead: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderStyle: 'dashed',
    paddingBottom: 15,
    paddingTop: 30,
  },
  rTitle: { fontFamily: 'Courier', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  rMeta: { fontFamily: 'Courier', fontSize: 10, color: '#666', marginTop: 8 },
  rBody: { paddingVertical: 15 },
  rRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rRowText: { fontFamily: 'Courier', fontSize: 12, color: '#111', flex: 1 },
  rRowTextBold: { fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: '#111' },
  rMiniMapWrap: {
    height: 140,
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 15,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rMiniMapImage: { width: '100%', height: '100%' },
  rMiniMapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  rMiniMapPlaceholderText: { fontFamily: 'Courier', fontSize: 11, color: '#888', marginTop: 4 },
  rFoot: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderStyle: 'dashed',
    paddingTop: 15,
    paddingBottom: 30,
  },
  rFootText: { fontFamily: 'Courier', fontSize: 11, color: '#111' },
  zigZag: { height: 10, backgroundColor: '#fff' },
  receiptActions: { flexDirection: 'row', gap: 12, position: 'absolute', bottom: 40 },
});
