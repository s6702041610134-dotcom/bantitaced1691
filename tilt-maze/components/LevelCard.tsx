import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LevelDefinition } from '../engine/types';
import { THEME } from '../constants/theme';

interface LevelCardProps {
  level: LevelDefinition;
  isUnlocked: boolean;
  starsEarned: number;
  highScore?: number;
  bestTime?: number;
  onSelect: () => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  isUnlocked,
  starsEarned,
  highScore,
  bestTime,
  onSelect,
}) => {
  const theme =
    THEME.levelThemes[level.id as keyof typeof THEME.levelThemes] ||
    THEME.levelThemes[1];

  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !isUnlocked && styles.cardLocked,
      ]}
      onPress={onSelect}
      disabled={!isUnlocked}
      activeOpacity={0.8}
    >
      {/* Top Banner Row */}
      <View style={styles.cardHeader}>
        <View style={styles.levelIndexBadge}>
          <View style={[styles.ledDot, isUnlocked ? styles.ledActive : styles.ledInactive]} />
          <Text style={styles.levelIndexText}>SECTOR 0{level.id}</Text>
        </View>

        <View style={styles.diffBadge}>
          <Text style={styles.diffText}>[{level.difficulty}]</Text>
        </View>
      </View>

      {/* Main Title & Subtitle */}
      <Text style={styles.titleText}>{level.title.toUpperCase()}</Text>
      <Text style={styles.subtitleText}>{theme.subtitle}</Text>

      {/* Stars Section */}
      <View style={styles.starsRow}>
        {[1, 2, 3].map(s => (
          <Text
            key={`card_star_${s}`}
            style={[
              styles.starIcon,
              s <= starsEarned && styles.starIconActive,
            ]}
          >
            {s <= starsEarned ? '★' : '☆'}
          </Text>
        ))}
      </View>

      {/* Stats Footer */}
      {isUnlocked && (
        <View style={styles.footerRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>HIGH SCORE:</Text>
            <Text style={styles.statValue}>
              {highScore ? highScore.toLocaleString() : '---'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BEST TIME:</Text>
            <Text style={styles.statValue}>{formatTime(bestTime)}</Text>
          </View>
        </View>
      )}

      {/* Lock Overlay */}
      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={16} color={THEME.colors.charcoal} />
            <Text style={styles.lockText}>LOCKED // CLEAR PREV SECTOR</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    position: 'relative',
    overflow: 'hidden',
  },
  cardLocked: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelIndexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.ivory,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.charcoal,
  },
  ledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ledActive: {
    backgroundColor: THEME.colors.olive,
  },
  ledInactive: {
    backgroundColor: THEME.colors.warmGray,
  },
  levelIndexText: {
    color: THEME.colors.charcoal,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.teal,
    letterSpacing: 1,
  },
  titleText: {
    color: THEME.colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  subtitleText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  starIcon: {
    fontSize: 16,
    color: THEME.colors.warmGray,
  },
  starIconActive: {
    color: THEME.colors.accentGold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.warmGray,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    color: THEME.colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(216, 212, 199, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.paper,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  lockText: {
    color: THEME.colors.charcoal,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
