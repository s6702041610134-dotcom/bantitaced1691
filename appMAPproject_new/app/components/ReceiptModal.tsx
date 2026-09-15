import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

type PlaceItem = {
  id: string;
  name: string;
  coordinate: { latitude: number; longitude: number };
};

type ReceiptModalProps = {
  visible: boolean;
  places: PlaceItem[];
  totalDistance: number | null;
  mapSnapshotUri: string | null;
  receiptNumber: string;
  journeyDate: Date;
  onClose: () => void;
};

export default function ReceiptModal({
  visible,
  places,
  totalDistance,
  mapSnapshotUri,
  receiptNumber,
  journeyDate,
  onClose,
}: ReceiptModalProps) {
  const receiptRef = useRef<View | null>(null);

  // Reanimated values for Thermal Printer Animation
  const receiptHeight = useSharedValue(0);
  const receiptOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);
  const actionsTranslateY = useSharedValue(20);

  useEffect(() => {
    if (visible) {
      // 1. Fade in modal background
      receiptOpacity.value = withTiming(1, { duration: 250 });

      // 2. Animate receipt paper feeding down (optimized for rich content)
      receiptHeight.value = withTiming(680, {
        duration: 1500,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });

      // 3. Animate action buttons appearing right after print completes
      const timeoutId = setTimeout(() => {
        actionsOpacity.value = withTiming(1, { duration: 350 });
        actionsTranslateY.value = withSpring(0);
      }, 1500);

      return () => clearTimeout(timeoutId);
    } else {
      receiptOpacity.value = 0;
      receiptHeight.value = 0;
      actionsOpacity.value = 0;
      actionsTranslateY.value = 20;
    }
  }, [visible]);

  const handlePrintAndSave = async () => {
    try {
      if (!receiptRef.current) {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบการแสดงผลใบเสร็จ');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));

      const uri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
        }
      } catch (err) {
        console.log('MediaLibrary error:', err);
      }

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

  if (!visible) return null;

  const formattedDate = journeyDate.toLocaleDateString('th-TH');
  const formattedTime = journeyDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  // Estimate travel time (~2.2 mins per km + 3 mins per stop)
  const estMinutes = totalDistance ? Math.max(10, Math.round(totalDistance * 2.2 + places.length * 3)) : places.length * 10;

  return (
    <Animated.View style={[styles.receiptModal, modalBackgroundStyle]}>
      {/* Thermal Printer Slot */}
      <View style={styles.printerSlot} />

      {/* Paper Container */}
      <Animated.View style={[styles.receiptPaper, receiptAnimatedStyle]}>
        <View ref={receiptRef} collapsable={false} style={styles.receiptPrintArea}>
          {/* Header */}
          <View style={styles.rHead}>
            <View style={styles.rBrandBadge}>
              <Text style={styles.rBrandBadgeText}>✦ BANGKOK URBAN TRANSIT ✦</Text>
            </View>
            <Text style={styles.rTitle}>TRAVEL RECEIPT</Text>
            <Text style={styles.rSubTitle}>OFFICIAL PASSENGER PASS</Text>

            <View style={styles.rMetaRow}>
              <Text style={styles.rMeta}>{formattedDate}</Text>
              <Text style={styles.rMeta}>•</Text>
              <Text style={styles.rMeta}>{formattedTime}</Text>
              <Text style={styles.rMeta}>•</Text>
              <Text style={styles.rMetaBold}>{receiptNumber}</Text>
            </View>
          </View>

          {/* Visited Places Timeline List */}
          <View style={styles.rBody}>
            <Text style={styles.rSectionHeader}>ITINERARY STOPS ({places.length})</Text>
            <View style={styles.rTimelineWrap}>
              {places.map((p, i) => {
                const isFirst = i === 0;
                const isLast = i === places.length - 1;
                return (
                  <View key={p.id} style={styles.rStopRow}>
                    <View style={styles.rStopIconCol}>
                      <Text style={styles.rStopBullet}>
                        {isFirst ? '📍' : isLast ? '🏁' : '⚪'}
                      </Text>
                      {!isLast && <View style={styles.rStopLine} />}
                    </View>
                    <Text style={styles.rStopName} numberOfLines={1}>
                      {(i + 1).toString().padStart(2, '0')}. {p.name}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Map Preview Image inside Vintage Stamp Frame */}
            <View style={styles.rMiniMapWrap}>
              <View style={styles.rMiniMapBadge}>
                <Text style={styles.rMiniMapBadgeText}>🗺️ GPS ROUTE SNAPSHOT</Text>
              </View>
              {mapSnapshotUri ? (
                <Image
                  source={{ uri: mapSnapshotUri }}
                  style={styles.rMiniMapImage}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              ) : (
                <View style={styles.rMiniMapPlaceholder}>
                  <Feather name="map" size={24} color="#888" />
                  <Text style={styles.rMiniMapPlaceholderText}>Route Map Preview</Text>
                </View>
              )}
            </View>

            {/* Summary Metrics Grid */}
            <View style={styles.rGrid}>
              <View style={styles.rGridItem}>
                <Text style={styles.rGridLbl}>TOTAL DISTANCE</Text>
                <Text style={styles.rGridVal}>
                  {totalDistance !== null ? `${totalDistance.toFixed(1)} km` : 'N/A'}
                </Text>
              </View>
              <View style={styles.rGridItemRight}>
                <Text style={styles.rGridLbl}>EST. TRAVEL TIME</Text>
                <Text style={styles.rGridVal}>~{estMinutes} mins</Text>
              </View>
            </View>

            <View style={[styles.rGrid, { marginTop: 6 }]}>
              <View style={styles.rGridItem}>
                <Text style={styles.rGridLbl}>STOPS VISITED</Text>
                <Text style={styles.rGridVal}>{places.length} places</Text>
              </View>
              <View style={styles.rGridItemRight}>
                <Text style={styles.rGridLbl}>JOURNEY STATUS</Text>
                <Text style={styles.rGridValSuccess}>COMPLETED ✓</Text>
              </View>
            </View>
          </View>

          {/* Barcode & Footer */}
          <View style={styles.rFoot}>
            <Text style={styles.rBarcodeText}>
              ||||| |||| || ||||| |||| || ||||| |||| ||
            </Text>
            <View style={styles.stampEmblem}>
              <Text style={styles.stampEmblemText}>★ VERIFIED TRAVEL MEMORY ★</Text>
            </View>
            <Text style={styles.rQuote}>"Every journey becomes a memory."</Text>
          </View>
        </View>

        {/* Paper Tear ZigZag Edge */}
        <View style={styles.zigZag} />
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.receiptActions, actionsStyle]}>
        <TouchableOpacity style={styles.btnSecondary} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.btnTextDark}>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handlePrintAndSave} activeOpacity={0.8}>
          <Text style={styles.btnText}>🖨 Print & Save</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  receiptModal: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(57, 29, 1, 0.82)',
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
  receiptPaper: {
    width: 310,
    backgroundColor: '#FAF8F5',
    overflow: 'hidden',
    marginBottom: 30,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  receiptPrintArea: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 18,
  },
  rHead: {
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#222',
    borderStyle: 'dashed',
    paddingBottom: 10,
    paddingTop: 20,
  },
  rBrandBadge: {
    backgroundColor: '#391D01',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  rBrandBadgeText: {
    fontFamily: 'Courier',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#CAD183',
    letterSpacing: 1,
  },
  rTitle: {
    fontFamily: 'Courier',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 3,
    color: '#111',
  },
  rSubTitle: {
    fontFamily: 'Courier',
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#555',
    marginTop: 1,
  },
  rMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  rMeta: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: '#444',
  },
  rMetaBold: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#66023C',
  },
  rBody: {
    paddingVertical: 10,
  },
  rSectionHeader: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#391D01',
    letterSpacing: 1,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 3,
  },
  rTimelineWrap: {
    marginBottom: 8,
  },
  rStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  rStopIconCol: {
    width: 18,
    alignItems: 'center',
    marginRight: 4,
  },
  rStopBullet: {
    fontSize: 10,
  },
  rStopLine: {
    width: 1,
    height: 8,
    backgroundColor: '#ccc',
  },
  rStopName: {
    fontFamily: 'Courier',
    fontSize: 11,
    fontWeight: '600',
    color: '#111',
    flex: 1,
  },
  rMiniMapWrap: {
    height: 160,
    width: '100%',
    backgroundColor: '#EFECE6',
    borderWidth: 1.5,
    borderColor: '#391D01',
    marginVertical: 8,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rMiniMapBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(57, 29, 1, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  rMiniMapBadgeText: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: '#CAD183',
    fontWeight: 'bold',
  },
  rMiniMapImage: {
    width: '100%',
    height: '100%',
  },
  rMiniMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  rMiniMapPlaceholderText: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  rGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  rGridItem: {
    flex: 1,
  },
  rGridItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rGridLbl: {
    fontFamily: 'Courier',
    fontSize: 8.5,
    color: '#666',
    letterSpacing: 0.5,
  },
  rGridVal: {
    fontFamily: 'Courier',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 1,
  },
  rGridValSuccess: {
    fontFamily: 'Courier',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#66023C',
    marginTop: 1,
  },
  rFoot: {
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#222',
    borderStyle: 'dashed',
    paddingTop: 8,
    paddingBottom: 16,
  },
  rBarcodeText: {
    fontFamily: 'Courier',
    fontSize: 15,
    letterSpacing: 2,
    color: '#222',
    marginVertical: 2,
  },
  stampEmblem: {
    borderWidth: 1,
    borderColor: '#66023C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginVertical: 3,
  },
  stampEmblemText: {
    fontFamily: 'Courier',
    fontSize: 8.5,
    color: '#66023C',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rQuote: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 3,
  },
  zigZag: {
    height: 10,
    backgroundColor: '#FAF8F5',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
    position: 'absolute',
    bottom: 24,
  },
  btnPrimary: {
    backgroundColor: '#66023C',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#66023C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  btnSecondary: {
    backgroundColor: '#CAD183',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: 'center',
  },
  btnText: {
    color: '#CAD183',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  btnTextDark: {
    color: '#391D01',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
