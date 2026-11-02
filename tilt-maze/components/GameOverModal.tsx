import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

interface GameOverModalProps {
  visible: boolean;
  reason: 'HOLE' | 'TIMEOUT' | 'HAZARD';
  onRetry: () => void;
  onLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  reason,
  onRetry,
  onLevelSelect,
}) => {
  const reasonText =
    reason === 'TIMEOUT'
      ? 'TIME EXPIRED // TIMEOUT'
      : reason === 'HOLE'
      ? 'CRITICAL FALL // ABYSS HOLE'
      : 'HAZARD COLLISION // STRUCTURAL FAILURE';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onLevelSelect}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.skullCircle}>
            <Text style={styles.skullEmoji}>⚠️</Text>
          </View>

          <Text style={styles.titleText}>SYSTEM OVERRIDE</Text>
          <Text style={styles.reasonText}>{reasonText}</Text>

          <View style={styles.tipsBox}>
            <Text style={styles.tipHeader}>[RECOVERY DIAGNOSTICS]</Text>
            <Text style={styles.tipDetail}>
              • เอียงตัวเครื่องทีละน้อยเพื่อชะลอแรงเหวี่ยง{'\n'}
              • สังเกตแรงดึงดูดของหลุมพรางล่วงหน้า{'\n'}
              • ไปที่หน้าตั้งค่าเพื่อปรับ Sensitivity ให้เหมาะกับระนาบมือ
            </Text>
          </View>

          <View style={styles.actionsColumn}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-sharp" size={16} color={THEME.colors.offWhite} />
              <Text style={styles.retryButtonText}>RETRY SECTOR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onLevelSelect}
              activeOpacity={0.8}
            >
              <Ionicons name="grid-sharp" size={14} color={THEME.colors.charcoal} />
              <Text style={styles.secondaryButtonText}>SELECT SECTOR</Text>
            </TouchableOpacity>
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
    borderColor: THEME.colors.danger,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  skullCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.danger,
    marginBottom: 10,
  },
  skullEmoji: {
    fontSize: 24,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.danger,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 11,
    color: THEME.colors.charcoal,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 14,
  },
  tipsBox: {
    width: '100%',
    backgroundColor: THEME.colors.ivory,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  tipHeader: {
    color: THEME.colors.charcoal,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  tipDetail: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  actionsColumn: {
    width: '100%',
    gap: 10,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.danger,
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
  retryButtonText: {
    color: THEME.colors.offWhite,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
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
