import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
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
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

import * as Location from 'expo-location';
import { captureRef } from 'react-native-view-shot';

// Sub-services and components
import { OYSTER_BAY_MAP_STYLE } from '../constants/MapStyle';
import { fetchOSRMRoute, Coordinate } from '../services/routing';
import { searchPlaces, reverseGeocode, SearchResult } from '../services/geocoding';
import ReceiptModal from '../components/ReceiptModal';
import { BlurView } from 'expo-blur';
import { FrostedGlassCard } from '../components/FrostedGlass';
import { fetchRealWeather, RealWeatherData } from '../services/weather';

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
  // Read incoming params from Explore screen "ดูบนแผนที่"
  const params = useLocalSearchParams<{ lat?: string; lng?: string; placeName?: string }>();

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

  // Real Weather Forecasting States
  const [weatherData, setWeatherData] = useState<RealWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [weatherLocationName, setWeatherLocationName] = useState('กรุงเทพมหานคร');

  // Compass & User Location States
  const [heading, setHeading] = useState<number>(0);
  const [showCompassModal, setShowCompassModal] = useState<boolean>(false);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);

  // Watch live compass heading
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          subscription = await Location.watchHeadingAsync((data) => {
            const h = Math.round(data.trueHeading >= 0 ? data.trueHeading : data.magHeading);
            setHeading(h);
          });
        }
      } catch (err) {
        console.log('Heading watch error:', err);
      }
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const getCardinalDirection = (deg: number): string => {
    const normalized = (deg % 360 + 360) % 360;
    if (normalized >= 337.5 || normalized < 22.5) return 'N (ทิศเหนือ)';
    if (normalized >= 22.5 && normalized < 67.5) return 'NE (ตะวันออกเฉียงเหนือ)';
    if (normalized >= 67.5 && normalized < 112.5) return 'E (ทิศตะวันออก)';
    if (normalized >= 112.5 && normalized < 157.5) return 'SE (ตะวันออกเฉียงใต้)';
    if (normalized >= 157.5 && normalized < 202.5) return 'S (ทิศใต้)';
    if (normalized >= 202.5 && normalized < 247.5) return 'SW (ตะวันตกเฉียงใต้)';
    if (normalized >= 247.5 && normalized < 292.5) return 'W (ทิศตะวันตก)';
    return 'NW (ตะวันตกเฉียงเหนือ)';
  };

  const resetMapToNorth = () => {
    mapRef.current?.animateCamera({ heading: 0, pitch: 0 }, { duration: 800 });
  };

  const goToUserLocation = async () => {
    try {
      setIsLocatingUser(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ขอสิทธิ์ตำแหน่ง GPS', 'โปรดอนุญาตสิทธิ์เข้าถึง GPS เพื่อระบุตำแหน่งปัจจุบันของคุณ');
        setIsLocatingUser(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        1000
      );
    } catch (err) {
      console.log('Location error:', err);
      Alert.alert('ระบุตำแหน่ง', 'ไม่สามารถดึงตำแหน่งปัจจุบันได้ในขณะนี้');
    } finally {
      setIsLocatingUser(false);
    }
  };

  const mapRef = useRef<MapView | null>(null);
  const mapContainerRef = useRef<View | null>(null);

  // --- Live Weather Fetcher ---
  const loadWeather = useCallback(async (lat: number, lon: number, locName?: string) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchRealWeather(lat, lon);
      setWeatherData(data);
      if (locName) setWeatherLocationName(locName);
    } catch (err) {
      console.log('Error fetching weather:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Default initial weather load (Bangkok)
  useEffect(() => {
    loadWeather(13.7563, 100.5018, 'กรุงเทพมหานคร');
  }, [loadWeather]);

  // Update live weather when places change (fetch for latest pinned place)
  useEffect(() => {
    if (places.length > 0) {
      const lastPlace = places[places.length - 1];
      loadWeather(lastPlace.coordinate.latitude, lastPlace.coordinate.longitude, lastPlace.name);
    }
  }, [places, loadWeather]);

  // --- 0. Auto-pin place passed from Explore (via URL params) ---
  useEffect(() => {
    const lat = params.lat ? parseFloat(params.lat) : null;
    const lng = params.lng ? parseFloat(params.lng) : null;
    const name = params.placeName ?? '📍 สถานที่จาก Explore';

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

    // Deduplicate: don't add if already pinned at same coords
    setPlaces((prev) => {
      const alreadyExists = prev.some(
        (p) =>
          Math.abs(p.coordinate.latitude - lat) < 0.0001 &&
          Math.abs(p.coordinate.longitude - lng) < 0.0001
      );
      if (alreadyExists) return prev;
      return [
        ...prev,
        {
          id: `explore-${lat}-${lng}`,
          name,
          coordinate: { latitude: lat, longitude: lng },
        },
      ];
    });

    // Animate map to the pinned place
    const timer = setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }, 600);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.lat, params.lng, params.placeName]);

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
    await new Promise((resolve) => setTimeout(resolve, 250));

    let snapshotUri: string | null = null;

    // 4a. Capture rendered map screen via ViewShot (100% reliable on Apple Maps & Google Maps)
    try {
      if (mapContainerRef.current) {
        const viewShotUri = await captureRef(mapContainerRef, {
          format: 'png',
          quality: 0.9,
          result: 'tmpfile',
        });
        if (viewShotUri) {
          snapshotUri = viewShotUri.startsWith('file://') || viewShotUri.startsWith('data:')
            ? viewShotUri
            : `file://${viewShotUri}`;
        }
      }
    } catch (viewErr) {
      console.log('captureRef error, trying native takeSnapshot:', viewErr);
    }

    // 4b. Native takeSnapshot fallback
    if (!snapshotUri && mapRef.current) {
      try {
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
      } catch (err) {
        console.log('File snapshot error:', err);
      }
    }

    // 4c. OpenStreetMap Static Map fallback if all else failed
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
      {/* Interactive Map View Container (Captured via ViewShot for 100% reliable receipt snapshots) */}
      <View ref={mapContainerRef} collapsable={false} style={StyleSheet.absoluteFill}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          onPress={handleMapPress}
          customMapStyle={Platform.OS === 'android' ? OYSTER_BAY_MAP_STYLE : undefined}
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
      </View>

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

          {/* Quick Preset Location Chips & Live Weather Button */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.presetScroll}
            contentContainerStyle={styles.presetContainer}
          >
            {/* Live Weather Chip */}
            <TouchableOpacity
              style={styles.weatherChip}
              onPress={() => setShowWeatherModal(true)}
              activeOpacity={0.8}
            >
              {isLoadingWeather ? (
                <ActivityIndicator size="small" color={Colors.freshlyRoasted} />
              ) : weatherData ? (
                <View style={styles.weatherChipContent}>
                  <Text style={styles.weatherEmoji}>{weatherData.emoji}</Text>
                  <Text style={styles.weatherTempText}>{weatherData.temperature}°C</Text>
                  <Text style={styles.weatherCondChipText} numberOfLines={1}>{weatherData.conditionText}</Text>
                </View>
              ) : (
                <Text style={styles.weatherCondChipText}>🌤️ สภาพอากาศสด</Text>
              )}
            </TouchableOpacity>

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

      {/* Real Weather Forecast Modal */}
      <Modal
        visible={showWeatherModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWeatherModal(false)}
      >
        <View style={styles.weatherModalOverlay}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <FrostedGlassCard style={styles.weatherModalCard} intensity={95}>
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={styles.weatherModalTitle}>พยากรณ์อากาศสด 🌤️</Text>
              <TouchableOpacity style={styles.modalHeaderCloseBtn} onPress={() => setShowWeatherModal(false)}>
                <Feather name="x" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.weatherModalSubTitle} numberOfLines={1}>
              📍 {weatherLocationName}
            </Text>

            {weatherData && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
                {/* Hero Weather Card */}
                <View style={styles.weatherHeroBox}>
                  <Text style={styles.weatherHeroEmoji}>{weatherData.emoji}</Text>
                  <Text style={styles.weatherHeroTemp}>{weatherData.temperature}°C</Text>
                  <Text style={styles.weatherHeroCond}>{weatherData.conditionText}</Text>

                  <View style={styles.weatherMetricRow}>
                    <View style={styles.weatherMetricItem}>
                      <Feather name="droplet" size={16} color="#2A7FA0" />
                      <Text style={styles.weatherMetricVal}>{weatherData.humidity}%</Text>
                      <Text style={styles.weatherMetricLbl}>ความชื้น</Text>
                    </View>
                    <View style={styles.weatherMetricDivider} />
                    <View style={styles.weatherMetricItem}>
                      <Feather name="wind" size={16} color="#2A7FA0" />
                      <Text style={styles.weatherMetricVal}>{weatherData.windSpeed} km/h</Text>
                      <Text style={styles.weatherMetricLbl}>ความเร็วลม</Text>
                    </View>
                  </View>
                </View>

                {/* 1. Time Period Summaries (เช้า, บ่าย, เย็น, ดึก) */}
                {weatherData.periods && weatherData.periods.length > 0 && (
                  <>
                    <Text style={styles.forecastSectionTitle}>🌅 พยากรณ์อากาศตามช่วงเวลาของวัน</Text>
                    <View style={styles.periodGrid}>
                      {weatherData.periods.map((p, idx) => (
                        <View key={idx} style={styles.periodCard}>
                          <View style={styles.periodHeader}>
                            <Text style={styles.periodEmoji}>{p.emoji}</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.periodName}>{p.periodName}</Text>
                              <Text style={styles.periodTime}>{p.timeRange}</Text>
                            </View>
                          </View>
                          <Text style={styles.periodTemp}>{p.temp}°C</Text>
                          <Text style={styles.periodCond} numberOfLines={1}>{p.conditionText}</Text>
                          {p.pop > 0 ? (
                            <View style={styles.periodPopBadge}>
                              <Feather name="umbrella" size={9} color="#2A7FA0" />
                              <Text style={styles.periodPopText}>ฝน {p.pop}%</Text>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* 2. 24-Hour Hourly Forecast Horizontal Scroll */}
                {weatherData.hourly && weatherData.hourly.length > 0 && (
                  <>
                    <Text style={styles.forecastSectionTitle}>⏰ พยากรณ์อากาศรายชั่วโมง (24 ชั่วโมง)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 2 }}>
                        {weatherData.hourly.map((h, idx) => (
                          <View key={idx} style={[styles.hourlyItemCard, idx === 0 && styles.hourlyItemActive]}>
                            <Text style={[styles.hourlyTimeText, idx === 0 && styles.hourlyTimeActive]}>{h.timeStr}</Text>
                            <Text style={styles.hourlyEmoji}>{h.emoji}</Text>
                            <Text style={styles.hourlyTemp}>{h.temp}°C</Text>
                            {h.pop > 0 ? (
                              <Text style={styles.hourlyPop}>☔ {h.pop}%</Text>
                            ) : (
                              <Text style={styles.hourlyPopEmpty}>-</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </>
                )}

                {/* 3. 7-Day Forecast Section */}
                <Text style={styles.forecastSectionTitle}>📅 พยากรณ์อากาศล่วงหน้า 7 วัน</Text>
                <View style={styles.forecastList}>
                  {weatherData.daily.map((item, idx) => (
                    <View key={idx} style={styles.forecastRow}>
                      <Text style={styles.forecastDayName}>{item.dayName}</Text>
                      <View style={styles.forecastCondWrap}>
                        <Text style={styles.forecastEmoji}>{item.emoji}</Text>
                        <Text style={styles.forecastCondText}>{item.conditionText}</Text>
                      </View>
                      {item.pop > 0 && (
                        <View style={styles.forecastPopBadge}>
                          <Feather name="umbrella" size={10} color="#2A7FA0" />
                          <Text style={styles.forecastPopText}>{item.pop}%</Text>
                        </View>
                      )}
                      <Text style={styles.forecastTempRange}>
                        {item.minTemp}° / <Text style={{ fontWeight: '700', color: '#111' }}>{item.maxTemp}°C</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </FrostedGlassCard>
        </View>
      </Modal>

      {/* Floating Map Controls (Compass & Current GPS Location) */}
      <View style={styles.floatingControlsCol} pointerEvents="box-none">
        {/* Floating Compass Button */}
        <TouchableOpacity
          style={styles.floatingControlBtn}
          onPress={() => {
            resetMapToNorth();
            setShowCompassModal(true);
          }}
          activeOpacity={0.85}
        >
          <View style={{ transform: [{ rotate: `-${heading}deg` }] }}>
            <Feather name="compass" size={20} color={Colors.freshlyRoasted} />
          </View>
          <Text style={styles.floatingControlText}>{heading}°</Text>
        </TouchableOpacity>

        {/* Floating GPS Current Location Button */}
        <TouchableOpacity
          style={styles.floatingControlBtn}
          onPress={goToUserLocation}
          activeOpacity={0.85}
        >
          {isLocatingUser ? (
            <ActivityIndicator size="small" color={Colors.freshlyRoasted} />
          ) : (
            <Feather name="navigation" size={20} color={Colors.freshlyRoasted} />
          )}
        </TouchableOpacity>
      </View>

      {/* Real Digital Compass Modal */}
      <Modal
        visible={showCompassModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompassModal(false)}
      >
        <View style={styles.weatherModalOverlay}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <FrostedGlassCard style={styles.compassModalCard} intensity={95}>
            <View style={styles.dragHandleWrap}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={styles.weatherModalTitle}>เข็มทิศนำทางดิจิทัล 🧭</Text>
              <TouchableOpacity style={styles.modalHeaderCloseBtn} onPress={() => setShowCompassModal(false)}>
                <Feather name="x" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.compassBody}>
              <Text style={styles.compassHeadingNum}>{heading}°</Text>
              <Text style={styles.compassHeadingDir}>{getCardinalDirection(heading)}</Text>

              {/* Rotating Compass Rose Dial */}
              <View style={styles.compassRoseWrap}>
                <View style={[styles.compassRoseDial, { transform: [{ rotate: `-${heading}deg` }] }]}>
                  <Text style={styles.compassNorthN}>N</Text>
                  <Text style={styles.compassEastE}>E</Text>
                  <Text style={styles.compassSouthS}>S</Text>
                  <Text style={styles.compassWestW}>W</Text>

                  {/* Compass Needles */}
                  <View style={styles.compassNeedleRed} />
                  <View style={styles.compassNeedleDark} />
                  <View style={styles.compassCenterPin} />
                </View>
              </View>

              <TouchableOpacity
                style={styles.btnResetNorth}
                onPress={() => {
                  resetMapToNorth();
                  setShowCompassModal(false);
                }}
              >
                <Feather name="navigation" size={16} color="#FFFFFF" />
                <Text style={styles.btnResetNorthText}>หมุนแผนที่ไปทางทิศเหนือ (Reset North)</Text>
              </TouchableOpacity>
            </View>
          </FrostedGlassCard>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(202, 209, 131, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 221, 127, 0.7)',
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#391D01',
  },
  presetScroll: { marginTop: 8 },
  presetContainer: { gap: 8 },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(186, 221, 127, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 221, 127, 0.9)',
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  presetChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#391D01',
  },
  dropdown: {
    backgroundColor: 'rgba(202, 209, 131, 0.96)',
    borderRadius: 20,
    marginTop: 8,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 221, 127, 0.7)',
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    maxHeight: 240,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(57, 29, 1, 0.1)',
  },
  dropdownText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#391D01',
    flex: 1,
  },

  markerContainer: { alignItems: 'center' },
  markerPin: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#66023C', marginBottom: 2 },
  markerLabel: { backgroundColor: '#391D01', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  markerText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#CAD183' },

  panelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#CAD183',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 10,
    maxHeight: '50%',
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(57, 29, 1, 0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  statVal: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: '#391D01' },
  statLbl: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#391D01',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeline: { paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', fontFamily: 'Inter_400Regular', color: '#391D01', marginTop: 20 },
  tlItem: { flexDirection: 'row', marginBottom: 16, position: 'relative' },
  tlLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -20,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(57, 29, 1, 0.25)',
  },
  tlNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BADD7F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  tlNumText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#391D01' },
  tlContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(186, 221, 127, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(57, 29, 1, 0.18)',
    borderRadius: 12,
    padding: 12,
  },
  tlName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#391D01' },
  tlDist: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#66023C' },
  finishWrap: { padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(57, 29, 1, 0.14)' },

  btnPrimary: {
    backgroundColor: '#66023C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
  },
  btnText: { color: '#CAD183', fontFamily: 'Inter_600SemiBold', fontSize: 14 },

  // Live Weather Chip & Modal Styles
  weatherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(202, 209, 131, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 221, 127, 0.8)',
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weatherEmoji: { fontSize: 14 },
  weatherTempText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#391D01' },
  weatherCondChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#66023C' },

  weatherModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  weatherModalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, width: '100%', maxHeight: '85%', padding: 24, paddingTop: 12, backgroundColor: '#CAD183' },
  dragHandleWrap: { alignItems: 'center', paddingTop: 4, paddingBottom: 10 },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(57, 29, 1, 0.2)' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(57, 29, 1, 0.12)' },
  modalHeaderCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(57, 29, 1, 0.08)', alignItems: 'center', justifyContent: 'center' },
  weatherModalTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, color: '#391D01' },
  weatherModalSubTitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(57, 29, 1, 0.6)', marginTop: 2 },

  weatherHeroBox: {
    backgroundColor: 'rgba(186, 221, 127, 0.45)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 221, 127, 0.7)',
  },
  weatherHeroEmoji: { fontSize: 44, marginBottom: 2 },
  weatherHeroTemp: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 40, color: '#391D01', lineHeight: 44 },
  weatherHeroCond: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#66023C', marginTop: 2 },
  weatherMetricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(57, 29, 1, 0.15)' },
  weatherMetricItem: { alignItems: 'center', flex: 1 },
  weatherMetricVal: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#391D01', marginTop: 4 },
  weatherMetricLbl: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(57, 29, 1, 0.6)', marginTop: 2 },
  weatherMetricDivider: { width: 1, height: 28, backgroundColor: 'rgba(57, 29, 1, 0.18)' },

  forecastSectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#391D01', marginTop: 14, marginBottom: 10 },
  forecastList: { backgroundColor: 'rgba(186, 221, 127, 0.3)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(57, 29, 1, 0.1)' },
  forecastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(57, 29, 1, 0.06)' },
  forecastDayName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#391D01', width: 54 },
  forecastCondWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  forecastEmoji: { fontSize: 16 },
  forecastCondText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(57, 29, 1, 0.75)' },
  forecastPopBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(102, 2, 60, 0.1)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  forecastPopText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#66023C' },
  forecastTempRange: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(57, 29, 1, 0.65)' },

  // Time Period Forecast Grid Styles (เช้า, บ่าย, เย็น, ดึก)
  periodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  periodCard: {
    width: (width - 68) / 2,
    backgroundColor: 'rgba(186, 221, 127, 0.3)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(57, 29, 1, 0.08)',
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  periodHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  periodEmoji: { fontSize: 18 },
  periodName: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#391D01' },
  periodTime: { fontFamily: 'Inter_400Regular', fontSize: 10, color: 'rgba(57, 29, 1, 0.55)' },
  periodTemp: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#391D01' },
  periodCond: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(57, 29, 1, 0.7)', marginTop: 2 },
  periodPopBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(102, 2, 60, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  periodPopText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#66023C' },

  // Hourly Forecast Item Styles
  hourlyItemCard: {
    width: 68,
    alignItems: 'center',
    backgroundColor: 'rgba(202, 209, 131, 0.4)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(57, 29, 1, 0.08)',
  },
  hourlyItemActive: {
    backgroundColor: '#66023C',
    borderColor: '#66023C',
  },
  hourlyTimeText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: 'rgba(57, 29, 1, 0.6)' },
  hourlyTimeActive: { fontFamily: 'Inter_700Bold', color: '#CAD183' },
  hourlyEmoji: { fontSize: 20, marginVertical: 4 },
  hourlyTemp: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#391D01' },
  hourlyPop: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#66023C', marginTop: 3 },
  hourlyPopEmpty: { fontFamily: 'Inter_400Regular', fontSize: 9, color: 'rgba(57, 29, 1, 0.3)', marginTop: 3 },

  // Floating Controls Column (Compass & Current Location Buttons)
  floatingControlsCol: {
    position: 'absolute',
    right: 16,
    bottom: 230,
    gap: 10,
    zIndex: 30,
    alignItems: 'center',
  },
  floatingControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#66023C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(102, 2, 60, 0.6)',
    shadowColor: '#66023C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingControlText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#CAD183',
    marginTop: -2,
  },

  // Compass Modal Card Styles
  compassModalCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '100%',
    padding: 24,
    paddingTop: 12,
    backgroundColor: '#CAD183',
    alignItems: 'center',
  },
  compassBody: { alignItems: 'center', marginVertical: 14, width: '100%' },
  compassHeadingNum: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 56, color: '#391D01', lineHeight: 56 },
  compassHeadingDir: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#66023C', marginBottom: 20 },
  compassRoseWrap: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(186, 221, 127, 0.4)',
    borderWidth: 3,
    borderColor: 'rgba(102, 2, 60, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  compassRoseDial: { width: '100%', height: '100%', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  compassNorthN: { position: 'absolute', top: 10, fontFamily: 'Inter_700Bold', fontSize: 16, color: '#66023C' },
  compassEastE: { position: 'absolute', right: 14, fontFamily: 'Inter_700Bold', fontSize: 15, color: '#391D01' },
  compassSouthS: { position: 'absolute', bottom: 10, fontFamily: 'Inter_700Bold', fontSize: 15, color: '#391D01' },
  compassWestW: { position: 'absolute', left: 14, fontFamily: 'Inter_700Bold', fontSize: 15, color: '#391D01' },
  compassCenterPin: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#391D01', borderWidth: 2, borderColor: '#CAD183', zIndex: 10 },
  compassNeedleRed: { position: 'absolute', top: 35, width: 6, height: 65, backgroundColor: '#66023C', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  compassNeedleDark: { position: 'absolute', bottom: 35, width: 6, height: 65, backgroundColor: '#391D01', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  btnResetNorth: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#66023C', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 999, width: '100%', shadowColor: '#66023C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  btnResetNorthText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#CAD183' },
});
