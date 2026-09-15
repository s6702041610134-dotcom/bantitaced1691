import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

type GlassProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
};

export function FrostedGlassCard({
  children,
  style,
  contentStyle,
  intensity = 75,
  tint = 'light',
}: GlassProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[StyleSheet.absoluteFill, styles.blurViewStyle]}
      />
      {/* Translucent Frosted Glass Border Glow */}
      <View style={styles.glassHighlight} pointerEvents="none" />
      <View style={[styles.cardContent, contentStyle]}>{children}</View>
    </View>
  );
}

type GlassButtonProps = GlassProps & {
  onPress?: () => void;
  activeOpacity?: number;
};

export function FrostedGlassButton({
  children,
  style,
  onPress,
  intensity = 60,
  tint = 'light',
  activeOpacity = 0.85,
}: GlassButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[styles.buttonContainer, style]}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[StyleSheet.absoluteFill, styles.blurViewStyle]}
      />
      <View style={styles.glassHighlight} pointerEvents="none" />
      <View style={styles.buttonContent}>{children}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(202, 209, 131, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(186, 221, 127, 0.6)',
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
  },
  blurViewStyle: {
    borderRadius: 32,
  },
  buttonContainer: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(202, 209, 131, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(186, 221, 127, 0.55)',
    shadowColor: '#391D01',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  glassHighlight: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: 'rgba(186, 221, 127, 0.5)',
    borderRadius: 32,
    opacity: 0.9,
  },
  cardContent: {
    padding: 20,
    zIndex: 10,   // must be above BlurView (zIndex: 0) to receive touch
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
});
