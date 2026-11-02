import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

interface WinModalProps {
  visible: boolean;
  starsEarned: number;
  totalStars: number;
  timeElapsed: number;
  finalScore: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  visible,
  starsEarned,
  totalStars,
  timeElapsed,
  finalScore,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onLevelSelect}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Trophy Indicator */}
          <View style={styles.badgeCircle}>
            <Text style={styles.badgeEmoji}>🏆</Text>
          </View>

          <Text style={styles.titleText}>EXTRACTION SUCCESS!</Text>
          <Text style={styles.subtitleText}>
            [SECTOR CLEARED // PORTAL LINK REACHED]
          </Text>

          {/* Star Rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3].map(sIndex => (
              <Text
                key={`star_badge_${sIndex}`}
                style={[
                  styles.starBadge,
                  sIndex <= starsEarned && styles.starBadgeActive,
                ]}
              >
                {sIndex <= starsEarned ? '★' : '☆'}
              </Text>
            ))}
          </View>

          {/* Stats Summary Panel */}
          <View style={styles.statsBox}>
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>TOTAL SCORE</Text>
              <Text style={styles.statScore}>{finalScore.toLocaleString()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>TIME ELAPSED</Text>
              <Text style={styles.statValue}>{formatTime(timeElapsed)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>STARS COLLECTED</Text>
              <Text style={styles.statValue}>
                {starsEarned} / {totalStars}
              </Text>
            </View>
          </View>

          {/* Actions Column */}
          <View style={styles.actionsColumn}>
            {hasNextLevel && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onNextLevel}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>NEXT SECTOR MATRIX</Text>
                <Ionicons name="arrow-forward-sharp" size={16} color={THEME.colors.offWhite} />
              </TouchableOpacity>
            )}

            <View style={styles.secondaryRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onReplay}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-sharp" size={14} color={THEME.colors.charcoal} />
                <Text style={styles.secondaryButtonText}>REPLAY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onLevelSelect}
                activeOpacity={0.8}
              >
                <Ionicons name="grid-sharp" size={14} color={THEME.colors.charcoal} />
                <Text style={styles.secondaryButtonText}>SECTORS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 37, 37, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME.colors.paper,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    marginBottom: 10,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.charcoal,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.teal,
    letterSpacing: 1,
    marginBottom: 14,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starBadge: {
    fontSize: 26,
    color: THEME.colors.warmGray,
  },
  starBadgeActive: {
    color: THEME.colors.accentGold,
  },
  statsBox: {
    width: '100%',
    backgroundColor: THEME.colors.ivory,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  statDivider: {
    height: 1,
    backgroundColor: THEME.colors.warmGray,
    marginVertical: 3,
  },
  statLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: {
    color: THEME.colors.charcoal,
    fontSize: 12,
    fontWeight: '900',
  },
  statScore: {
    color: THEME.colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
  },
  actionsColumn: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.teal,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primaryButtonText: {
    color: THEME.colors.offWhite,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.paper,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  secondaryButtonText: {
    color: THEME.colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
