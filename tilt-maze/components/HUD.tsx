import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

interface HUDProps {
  levelTitle: string;
  lives: number;
  maxLives: number;
  starsCollected: number;
  totalStars: number;
  hasKeyPink: boolean;
  hasKeyBlue: boolean;
  timeRemaining?: number; // for timed levels
  timeElapsed: number;
  isSensorActive: boolean;
  onPause: () => void;
  onToggleVirtualPad: () => void;
  virtualPadActive: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  levelTitle,
  lives,
  maxLives,
  starsCollected,
  totalStars,
  hasKeyPink,
  hasKeyBlue,
  timeRemaining,
  timeElapsed,
  isSensorActive,
  onPause,
  onToggleVirtualPad,
  virtualPadActive,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isTimeCritical = timeRemaining !== undefined && timeRemaining <= 15;

  return (
    <View style={styles.hudContainer}>
      {/* Top Control Bar */}
      <View style={styles.topRow}>
        {/* Pause Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPause}
          activeOpacity={0.7}
        >
          <Ionicons name="pause-sharp" size={16} color={THEME.colors.charcoal} />
        </TouchableOpacity>

        {/* Level Title CRT Badge */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelTitleText}>{levelTitle.toUpperCase()}</Text>
        </View>

        {/* Sensor & Virtual Controls Toggle */}
        <TouchableOpacity
          style={[
            styles.sensorPill,
            virtualPadActive && styles.virtualPillActive,
          ]}
          onPress={onToggleVirtualPad}
          activeOpacity={0.7}
        >
          <Ionicons
            name={virtualPadActive ? 'game-controller-sharp' : 'phone-portrait-sharp'}
            size={12}
            color={THEME.colors.charcoal}
          />
          <Text style={styles.sensorText}>
            {virtualPadActive ? 'PAD' : isSensorActive ? 'SENSOR' : 'VIRTUAL'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Retro Stats Strip */}
      <View style={styles.statsRow}>
        {/* Lives (Hearts) */}
        <View style={styles.statChip}>
          {Array.from({ length: maxLives }).map((_, i) => (
            <Text key={`heart_${i}`} style={styles.heartIcon}>
              {i < lives ? '❤️' : '🖤'}
            </Text>
          ))}
        </View>

        {/* Stars */}
        <View style={styles.statChip}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.statValueText}>
            {starsCollected}/{totalStars}
          </Text>
        </View>

        {/* Keys if any collected */}
        {(hasKeyPink || hasKeyBlue) && (
          <View style={styles.statChip}>
            {hasKeyPink && <Text style={styles.keyIcon}>🗝️</Text>}
            {hasKeyBlue && <Text style={styles.keyIcon}>🔑</Text>}
          </View>
        )}

        {/* Timer */}
        <View
          style={[
            styles.statChip,
            isTimeCritical && styles.statChipDanger,
          ]}
        >
          <Ionicons
            name="timer-sharp"
            size={12}
            color={isTimeCritical ? THEME.colors.danger : THEME.colors.charcoal}
          />
          <Text
            style={[
              styles.timerText,
              isTimeCritical && styles.timerTextDanger,
            ]}
          >
            {timeRemaining !== undefined
              ? formatTime(timeRemaining)
              : formatTime(timeElapsed)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: THEME.colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: THEME.colors.tealDark,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  levelTitleText: {
    color: THEME.colors.mint,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sensorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: THEME.colors.paper,
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  virtualPillActive: {
    backgroundColor: THEME.colors.olive,
  },
  sensorText: {
    color: THEME.colors.charcoal,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: THEME.colors.paper,
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  statChipDanger: {
    backgroundColor: THEME.colors.ivory,
    borderColor: THEME.colors.danger,
  },
  heartIcon: {
    fontSize: 12,
    marginHorizontal: 1,
  },
  starIcon: {
    fontSize: 12,
    color: THEME.colors.accentGold,
  },
  keyIcon: {
    fontSize: 12,
  },
  statValueText: {
    color: THEME.colors.charcoal,
    fontSize: 11,
    fontWeight: '900',
  },
  timerText: {
    color: THEME.colors.charcoal,
    fontSize: 11,
    fontWeight: '900',
  },
  timerTextDanger: {
    color: THEME.colors.danger,
    fontWeight: '900',
  },
});
