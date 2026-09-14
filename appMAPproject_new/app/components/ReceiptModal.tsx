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
import { Colors } from '../../constants/Colors';

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

      // 2. Animate receipt paper feeding down (optimized to 1.5s for fast UX)
      receiptHeight.value = withTiming(540, {
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

      // Small delay to ensure all nested images in view are 100% rendered
      await new Promise((resolve) => setTimeout(resolve, 250));

      const uri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // Save to photo library if permitted
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

  if (!visible) return null;

  const formattedDate = journeyDate.toLocaleDateString('th-TH');
  const formattedTime = journeyDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View style={[styles.receiptModal, modalBackgroundStyle]}>
      {/* Thermal Printer Output Slot */}
      <View style={styles.printerSlot} />

      {/* Paper Container */}
      <Animated.View style={[styles.receiptPaper, receiptAnimatedStyle]}>
        <View ref={receiptRef} collapsable={false} style={styles.receiptPrintArea}>
          {/* Header */}
          <View style={styles.rHead}>
            <Text style={styles.rTitle}>TRAVEL RECEIPT</Text>
            <Text style={styles.rMeta}>
              {formattedDate} • {formattedTime} • {receiptNumber}
            </Text>
          </View>

          {/* Visited Places List */}
          <View style={styles.rBody}>
            {places.map((p, i) => (
              <View key={p.id} style={styles.rRow}>
                <Text style={styles.rRowText}>
                  {(i + 1).toString().padStart(2, '0')}. {p.name}
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
                  <Feather name="map" size={24} color="#888" />
                  <Text style={styles.rMiniMapPlaceholderText}>Route Map Preview</Text>
                </View>
              )}
            </View>

            {/* Distance and Places Summary */}
            <View style={[styles.rRow, { marginTop: 15 }]}>
              <Text style={styles.rRowTextBold}>TOTAL DISTANCE</Text>
              <Text style={styles.rRowTextBold}>
                {totalDistance !== null ? `${totalDistance.toFixed(1)} km` : 'Distance unavailable'}
              </Text>
            </View>
            <View style={styles.rRow}>
              <Text style={styles.rRowTextBold}>PLACES VISITED</Text>
              <Text style={styles.rRowTextBold}>{places.length}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.rFoot}>
            <Text style={styles.rFootText}>TRIP COMPLETED ✓</Text>
            <Text style={[styles.rFootText, { marginTop: 6 }]}>
              "Every journey becomes a memory."
            </Text>
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
  receiptPaper: {
    width: 290,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 40,
  },
  receiptPrintArea: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  rHead: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderStyle: 'dashed',
    paddingBottom: 15,
    paddingTop: 30,
  },
  rTitle: {
    fontFamily: 'Courier',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  rMeta: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: '#666',
    marginTop: 8,
  },
  rBody: {
    paddingVertical: 15,
  },
  rRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rRowText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#111',
    flex: 1,
  },
  rRowTextBold: {
    fontFamily: 'Courier',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111',
  },
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
  rFoot: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderStyle: 'dashed',
    paddingTop: 15,
    paddingBottom: 30,
  },
  rFootText: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#111',
  },
  zigZag: {
    height: 10,
    backgroundColor: '#fff',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
    position: 'absolute',
    bottom: 40,
  },
  btnPrimary: {
    backgroundColor: Colors.freshlyRoasted,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: Colors.butter,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
  },
  btnText: {
    color: Colors.oldLace,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  btnTextDark: {
    color: Colors.freshlyRoasted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
