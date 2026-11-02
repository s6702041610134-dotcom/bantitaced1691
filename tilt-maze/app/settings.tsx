import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameStorage, DEFAULT_SETTINGS } from '../store/gameStore';
import { UserSettings } from '../engine/types';
import { useMotionSensors } from '../hooks/useMotionSensors';
import { SoundHaptics } from '../engine/audioHaptics';
import { THEME } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [calibratedNotice, setCalibratedNotice] = useState<boolean>(false);

  const { tilt, rawAccel, rawGyro, isSensorAvailable, calibrateNeutral } =
    useMotionSensors({
      sensitivity: settings.sensitivity,
      filterAlpha: settings.filterAlpha,
      calibratedOffset: settings.calibratedOffset,
    });

  useEffect(() => {
    GameStorage.loadSettings().then(setSettings);
  }, []);

  const updateSettings = async (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await GameStorage.saveSettings(updated);
  };

  const handleCalibrate = () => {
    const offset = calibrateNeutral();
    updateSettings({ calibratedOffset: offset });
    SoundHaptics.playKeyCollect(settings.soundEnabled, settings.hapticsEnabled);
    setCalibratedNotice(true);
    setTimeout(() => setCalibratedNotice(false), 2500);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'RESET METRICS',
      'คุณต้องการล้างคะแนนและด่านที่ปลดล็อกทั้งหมดใช่หรือไม่?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'RESET',
          style: 'destructive',
          onPress: async () => {
            await GameStorage.saveProgress({
              unlockedLevels: [1],
              highScores: {},
              starsEarned: {},
              bestTimes: {},
            });
            Alert.alert('SUCCESS', 'รีเซ็ตข้อมูลระบบเรียบร้อยแล้ว');
          },
        },
      ]
    );
  };

  // Convert radians to degrees for human-friendly readout
  const pitchDeg = Math.round((tilt.y * 180) / Math.PI);
  const rollDeg = Math.round((tilt.x * 180) / Math.PI);

  // Bubble level position in visual gauge (-1 to +1 -> clamp to visual container)
  const bubbleX = Math.max(-40, Math.min(40, (tilt.x / 0.6) * 40));
  const bubbleY = Math.max(-40, Math.min(40, (tilt.y / 0.6) * 40));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={THEME.colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SYSTEM CALIBRATION & LAB</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollList}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. CRT Oscilloscope Gauge Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.statusLed} />
            <Text style={styles.cardTitle}>LIVE OSCILLOSCOPE // GAUGING UNIT</Text>
          </View>

          <Text style={styles.cardDesc}>
            เอียงอุปกรณ์ของคุณเพื่อตรวจสอบค่าเบี่ยงเบนมุมก้ม/เงยและเอียง
          </Text>

          {/* Recessed CRT Bubble Level */}
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeCrtCircle}>
              <View style={styles.gaugeCrosshairH} />
              <View style={styles.gaugeCrosshairV} />
              <View style={styles.gaugeDeadzoneRing} />

              {/* Moving CRT Bubble */}
              <View
                style={[
                  styles.gaugeBubble,
                  {
                    transform: [
                      { translateX: bubbleX },
                      { translateY: bubbleY },
                    ],
                  },
                ]}
              >
                <View style={styles.gaugeBubbleCore} />
              </View>
            </View>

            {/* Readout Stats */}
            <View style={styles.readoutBox}>
              <View style={styles.readoutItem}>
                <Text style={styles.readoutLabel}>PITCH (ก้ม/เงย)</Text>
                <Text style={styles.readoutValue}>{pitchDeg}°</Text>
              </View>
              <View style={styles.readoutDivider} />
              <View style={styles.readoutItem}>
                <Text style={styles.readoutLabel}>ROLL (เอียงซ้าย/ขวา)</Text>
                <Text style={styles.readoutValue}>{rollDeg}°</Text>
              </View>
            </View>
          </View>

          {/* Calibrate Neutral Button */}
          <TouchableOpacity
            style={styles.calibrateBtn}
            onPress={handleCalibrate}
            activeOpacity={0.8}
          >
            <Ionicons name="locate-sharp" size={18} color={THEME.colors.offWhite} />
            <Text style={styles.calibrateBtnText}>
              SET CURRENT PLANE AS ZERO (CALIBRATE)
            </Text>
          </TouchableOpacity>

          {calibratedNotice && (
            <Text style={styles.calibratedSuccessText}>
              ✓ ZERO-POINT CALIBRATED // PLANE SAVED
            </Text>
          )}
        </View>

        {/* 2. Sensitivity Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>SENSITIVITY COEFFICIENT</Text>
          </View>
          <Text style={styles.cardDesc}>
            CURRENT GAIN: {settings.sensitivity.toFixed(2)}x
          </Text>

          {/* Quick Preset Buttons */}
          <View style={styles.presetRow}>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map(val => (
              <TouchableOpacity
                key={`sens_${val}`}
                style={[
                  styles.presetBtn,
                  settings.sensitivity === val && styles.presetBtnActive,
                ]}
                onPress={() => updateSettings({ sensitivity: val })}
              >
                <Text
                  style={[
                    styles.presetBtnText,
                    settings.sensitivity === val && styles.presetBtnTextActive,
                  ]}
                >
                  {val}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. Sensor Fusion Alpha Tuning */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>SENSOR FUSION COMPLEMENTARY ALPHA</Text>
          </View>
          <Text style={styles.cardDesc}>
            GYROSCOPE WEIGHT: {Math.round(settings.filterAlpha * 100)}% (RECOMMENDED: 85%)
          </Text>

          <View style={styles.presetRow}>
            {[0.7, 0.8, 0.85, 0.9, 0.95].map(val => (
              <TouchableOpacity
                key={`alpha_${val}`}
                style={[
                  styles.presetBtn,
                  settings.filterAlpha === val && styles.presetBtnActive,
                ]}
                onPress={() => updateSettings({ filterAlpha: val })}
              >
                <Text
                  style={[
                    styles.presetBtnText,
                    settings.filterAlpha === val && styles.presetBtnTextActive,
                  ]}
                >
                  {Math.round(val * 100)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Feedback & Audio Toggles */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>AUDIO & HAPTIC FEEDBACK</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>HAPTIC VIBRATION</Text>
              <Text style={styles.toggleDesc}>สั่นเตือน tactile เมื่อกระทบกำแพง หรือเก็บไอเทม</Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={val => updateSettings({ hapticsEnabled: val })}
              trackColor={{ false: THEME.colors.warmGray, true: THEME.colors.teal }}
              thumbColor={settings.hapticsEnabled ? THEME.colors.olive : THEME.colors.ivory}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>SOUND FX SYNTHESIS</Text>
              <Text style={styles.toggleDesc}>เสียงสังเคราะห์จำลองการเคลื่อนที่และกระทบ</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={val => updateSettings({ soundEnabled: val })}
              trackColor={{ false: THEME.colors.warmGray, true: THEME.colors.teal }}
              thumbColor={settings.soundEnabled ? THEME.colors.olive : THEME.colors.ivory}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>VIRTUAL PAD DEFAULT</Text>
              <Text style={styles.toggleDesc}>เปิดใช้งาน Virtual Pad เป็นค่าเริ่มต้นบน Web/Sim</Text>
            </View>
            <Switch
              value={settings.virtualPadEnabled}
              onValueChange={val => updateSettings({ virtualPadEnabled: val })}
              trackColor={{ false: THEME.colors.warmGray, true: THEME.colors.teal }}
              thumbColor={settings.virtualPadEnabled ? THEME.colors.olive : THEME.colors.ivory}
            />
          </View>
        </View>

        {/* 5. Danger Zone */}
        <View style={[styles.card, { borderColor: THEME.colors.danger }]}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetProgress}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-bin-sharp" size={16} color={THEME.colors.danger} />
            <Text style={styles.resetBtnText}>FACTORY RESET ALL GAME DATA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.ivory,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.charcoal,
    backgroundColor: THEME.colors.paper,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: THEME.colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.charcoal,
    letterSpacing: 1,
  },
  scrollList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.colors.paper,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.olive,
    borderWidth: 1,
    borderColor: THEME.colors.charcoal,
  },
  cardTitle: {
    color: THEME.colors.charcoal,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 14,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  gaugeCrtCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME.colors.tealDark,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gaugeCrosshairH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(145, 185, 167, 0.25)',
  },
  gaugeCrosshairV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(145, 185, 167, 0.25)',
  },
  gaugeDeadzoneRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(180, 201, 106, 0.5)',
  },
  gaugeBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.olive,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  gaugeBubbleCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.offWhite,
  },
  readoutBox: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    backgroundColor: THEME.colors.ivory,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  readoutItem: {
    alignItems: 'center',
  },
  readoutDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.warmGray,
  },
  readoutLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  readoutValue: {
    color: THEME.colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
  },
  calibrateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.teal,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
  },
  calibrateBtnText: {
    color: THEME.colors.offWhite,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  calibratedSuccessText: {
    color: THEME.colors.teal,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: THEME.colors.ivory,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  presetBtnActive: {
    backgroundColor: THEME.colors.olive,
  },
  presetBtnText: {
    color: THEME.colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
  },
  presetBtnTextActive: {
    color: THEME.colors.charcoal,
    fontWeight: '900',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleLabel: {
    color: THEME.colors.charcoal,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  toggleDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.warmGray,
    marginVertical: 8,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  resetBtnText: {
    color: THEME.colors.danger,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
