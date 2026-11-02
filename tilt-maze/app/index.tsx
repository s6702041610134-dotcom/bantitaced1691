import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Rect,
  Line,
} from 'react-native-svg';
import { GameStorage } from '../store/gameStore';
import { UserGameProgress } from '../engine/types';
import { LEVELS } from '../data/levels';
import { THEME } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserGameProgress | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [heroAngle, setHeroAngle] = useState<number>(0);

  useEffect(() => {
    GameStorage.loadProgress().then(setProgress);
  }, []);

  // Subtle floating animation for Hero Ball inside CRT screen
  useEffect(() => {
    let anim: number;
    let tick = 0;
    const loop = () => {
      tick += 0.04;
      setHeroAngle(tick);
      anim = requestAnimationFrame(loop);
    };
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, []);

  const highestUnlocked = progress
    ? Math.max(...progress.unlockedLevels, 1)
    : 1;

  const totalStarsEarned = progress
    ? Object.values(progress.starsEarned).reduce((a, b) => a + b, 0)
    : 0;

  const totalPossibleStars = LEVELS.reduce(
    (acc, lvl) => acc + lvl.collectibles.filter(c => c.type === 'STAR').length,
    0
  );

  const heroBallX = Math.sin(heroAngle) * 16;
  const heroBallY = Math.cos(heroAngle * 0.8) * 12;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Device Brand Header Rule */}
        <View style={styles.deviceHeader}>
          <View style={styles.deviceRule} />
          <Text style={styles.deviceBrandLabel}>MODEL T-3D // TILT MATRIX CONSOLE</Text>
          <View style={styles.deviceRule} />
        </View>

        {/* Recessed CRT Screen Panel */}
        <View style={styles.crtFrame}>
          <View style={styles.crtHeaderBar}>
            <View style={styles.statusIndicatorGroup}>
              <View style={styles.statusLedActive} />
              <Text style={styles.crtHeaderLabel}>SYS.STATUS // READY</Text>
            </View>
            <TouchableOpacity
              style={styles.crtSettingsBtn}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-sharp" size={14} color="#91B9A7" />
            </TouchableOpacity>
          </View>

          {/* CRT Screen Display */}
          <View style={styles.crtScreen}>
            {/* Fine Scanline Overlay Lines */}
            <View style={styles.scanlineOverlay} pointerEvents="none" />

            {/* SVG Hero CRT Visual */}
            <View style={styles.heroSvgWrapper}>
              <Svg width={220} height={150} viewBox="0 0 220 150">
                <Defs>
                  <RadialGradient id="crtBgGrad" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#285B58" />
                    <Stop offset="90%" stopColor="#183D3D" />
                    <Stop offset="100%" stopColor="#0E2424" />
                  </RadialGradient>

                  <RadialGradient
                    id="heroBallGrad"
                    cx="35%"
                    cy="30%"
                    r="65%"
                  >
                    <Stop offset="0%" stopColor="#FAF9F4" />
                    <Stop offset="30%" stopColor="#B4C96A" />
                    <Stop offset="85%" stopColor="#285B58" />
                    <Stop offset="100%" stopColor="#183D3D" />
                  </RadialGradient>
                </Defs>

                {/* CRT Matrix Grid Floor */}
                <Rect x={10} y={20} width={200} height={110} rx={12} fill="url(#crtBgGrad)" stroke="#285B58" strokeWidth={2} />
                <Rect x={30} y={35} width={160} height={80} rx={6} fill="none" stroke="#91B9A7" strokeWidth={1} strokeDasharray="4,4" opacity={0.3} />

                {/* Goal Ring */}
                <Circle cx={155} cy={75} r={18} fill="none" stroke="#B4C96A" strokeWidth={2} strokeDasharray="4,3" />
                <Circle cx={155} cy={75} r={8} fill="#B4C96A" opacity={0.8} />

                {/* Hole Pit */}
                <Circle cx={65} cy={75} r={14} fill="#0E2424" stroke="#C84B31" strokeWidth={1.5} />

                {/* Ball Drop Shadow */}
                <Circle cx={110 + heroBallX} cy={80 + heroBallY * 0.4} r={16} fill="rgba(14, 36, 36, 0.7)" />

                {/* Tactile Ball */}
                <Circle cx={110 + heroBallX} cy={60 + heroBallY} r={20} fill="url(#heroBallGrad)" stroke="#242525" strokeWidth={1.5} />
                <Circle cx={104 + heroBallX} cy={54 + heroBallY} r={4} fill="#FAF9F4" opacity={0.9} />
              </Svg>
            </View>

            {/* CRT Screen Title & Text */}
            <View style={styles.crtTitleBlock}>
              <Text style={styles.crtTitleText}>TILT MAZE 3D</Text>
              <Text style={styles.crtSubtitleText}>ANALOG RECESSED DISPLAY ENGINE</Text>
              <Text style={styles.crtTechSpecs}>SENSOR FUSION: ACCEL + GYRO v2.4</Text>
            </View>
          </View>
        </View>

        {/* Physical Status & Progress Panel */}
        <View style={styles.tactileCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderLabel}>DEVICE METRICS</Text>
            <View style={styles.ledIndicator} />
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>UNLOCKED SECTORS</Text>
              <Text style={styles.metricValue}>
                0{highestUnlocked} / 0{LEVELS.length}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>STAR COLLECTIBLES</Text>
              <Text style={styles.metricValue}>
                ★ {totalStarsEarned} / {totalPossibleStars}
              </Text>
            </View>
          </View>
        </View>

        {/* Physical Control Panel (Tactile Buttons) */}
        <View style={styles.controlPanel}>
          {/* Main Play Button */}
          <TouchableOpacity
            style={styles.btnTactilePrimary}
            onPress={() => router.push(`/game/${highestUnlocked}`)}
            activeOpacity={0.8}
          >
            <View style={styles.btnIndicatorDot} />
            <Text style={styles.btnTactilePrimaryText}>
              INITIALIZE SECTOR 0{highestUnlocked}
            </Text>
            <Ionicons name="caret-forward" size={16} color="#FAF9F4" />
          </TouchableOpacity>

          {/* Level Select Button */}
          <TouchableOpacity
            style={styles.btnTactileSecondary}
            onPress={() => router.push('/levels')}
            activeOpacity={0.8}
          >
            <Ionicons name="grid-sharp" size={16} color="#242525" />
            <Text style={styles.btnTactileSecondaryText}>
              SELECT MAZE MATRIX (1 - 4)
            </Text>
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            style={styles.btnTactileSecondary}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
          >
            <Ionicons name="options-sharp" size={16} color="#242525" />
            <Text style={styles.btnTactileSecondaryText}>
              CALIBRATE SENSOR & DEVIATION
            </Text>
          </TouchableOpacity>

          {/* How to Play Manual Button */}
          <TouchableOpacity
            style={styles.btnTactileGhost}
            onPress={() => setShowHowToPlay(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={16} color="#5A5D5C" />
            <Text style={styles.btnTactileGhostText}>
              [MANUAL // OPERATING INSTRUCTIONS]
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Manual / How to Play Modal */}
      <Modal
        visible={showHowToPlay}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHowToPlay(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SYSTEM MANUAL T-3D</Text>
              <TouchableOpacity
                onPress={() => setShowHowToPlay(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={18} color="#242525" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleIndex}>01</Text>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>TILT MATRIX CONTROL</Text>
                  <Text style={styles.ruleDesc}>
                    เอียงตัวเครื่องเพื่อเปิดใช้งานแรงโน้มถ่วงจำลอง Sensor Fusion รวมค่า Accelerometer & Gyroscope เพื่อให้ตอบสนองแม่นยำ
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleIndex}>02</Text>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>ABYSS HOLE AVOIDANCE</Text>
                  <Text style={styles.ruleDesc}>
                    หลบหลุมพรางมรณะที่มีแรงดูด หากลูกบอลตกจะสูญเสียพลังชีวิต 1 ดวง
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleIndex}>03</Text>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>COLLECTIBLES & KEYS</Text>
                  <Text style={styles.ruleDesc}>
                    เก็บดาวเพื่อสะสมคะแนนสูงสุด และเก็บกุญแจเพื่อปลดล็อกประตูกล
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleIndex}>04</Text>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>PORTAL EXTRACTION</Text>
                  <Text style={styles.ruleDesc}>
                    พาลูกบอลไปยังประตูมิติสีเขียวโอลีฟก่อนเวลาหมดเพื่อจบด่าน!
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHowToPlay(false)}
            >
              <Text style={styles.modalCloseButtonText}>ACKNOWLEDGE & CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.ivory,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  deviceHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  deviceRule: {
    flex: 1,
    height: 2,
    backgroundColor: THEME.colors.charcoal,
  },
  deviceBrandLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: THEME.colors.charcoal,
  },
  crtFrame: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: THEME.colors.teal,
    borderRadius: 16,
    padding: 10,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 20,
  },
  crtHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  statusIndicatorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLedActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.olive,
    borderWidth: 1,
    borderColor: THEME.colors.charcoal,
  },
  crtHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME.colors.mint,
  },
  crtSettingsBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: THEME.colors.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.mint,
  },
  crtScreen: {
    backgroundColor: THEME.colors.tealDark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    position: 'relative',
    overflow: 'hidden',
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(145, 185, 167, 0.08)',
  },
  heroSvgWrapper: {
    marginVertical: 4,
    alignItems: 'center',
  },
  crtTitleBlock: {
    alignItems: 'center',
    marginTop: 8,
  },
  crtTitleText: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.mint,
    letterSpacing: 3,
  },
  crtSubtitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.olive,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  crtTechSpecs: {
    fontSize: 9,
    fontWeight: '600',
    color: THEME.colors.warmGray,
    letterSpacing: 1,
    marginTop: 4,
  },
  tactileCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: THEME.colors.paper,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.warmGray,
    paddingBottom: 6,
  },
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.charcoal,
  },
  ledIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.olive,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.charcoal,
    letterSpacing: 1,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.warmGray,
  },
  controlPanel: {
    width: '100%',
    maxWidth: 380,
    gap: 12,
  },
  btnTactilePrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: THEME.colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  btnIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.olive,
    borderWidth: 1,
    borderColor: THEME.colors.charcoal,
  },
  btnTactilePrimaryText: {
    color: THEME.colors.offWhite,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnTactileSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.paper,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  btnTactileSecondaryText: {
    color: THEME.colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  btnTactileGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  btnTactileGhostText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 37, 37, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: THEME.colors.paper,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.warmGray,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    color: THEME.colors.charcoal,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.charcoal,
  },
  modalBody: {
    maxHeight: 280,
    marginBottom: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  ruleIndex: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.teal,
    backgroundColor: THEME.colors.ivory,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.charcoal,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    color: THEME.colors.charcoal,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  ruleDesc: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  modalCloseButton: {
    backgroundColor: THEME.colors.teal,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
  },
  modalCloseButtonText: {
    color: THEME.colors.offWhite,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
