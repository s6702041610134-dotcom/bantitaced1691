import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Text,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Vector2D } from '../engine/types';
import { THEME } from '../constants/theme';

interface VirtualTiltControlsProps {
  onTiltChange: (tilt: Vector2D) => void;
  currentTilt: Vector2D;
}

export const VirtualTiltControls: React.FC<VirtualTiltControlsProps> = ({
  onTiltChange,
  currentTilt,
}) => {
  const padSize = 100;
  const knobSize = 40;
  const maxRadius = (padSize - knobSize) / 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        let dx = gestureState.dx;
        let dy = gestureState.dy;

        const dist = Math.hypot(dx, dy);
        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }

        // Map to -0.6 to +0.6 rad tilt
        const normalizedX = (dx / maxRadius) * 0.6;
        const normalizedY = (dy / maxRadius) * 0.6;

        onTiltChange({ x: normalizedX, y: normalizedY });
      },
      onPanResponderRelease: () => {
        // Return to neutral
        onTiltChange({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => {
        onTiltChange({ x: 0, y: 0 });
      },
    })
  ).current;

  // Knob visual offset
  const knobX = (currentTilt.x / 0.6) * maxRadius;
  const knobY = (currentTilt.y / 0.6) * maxRadius;

  return (
    <View style={styles.container}>
      <Text style={styles.hintText}>
        [ANALOG JOYSTICK // TILT VECTOR]
      </Text>
      <View
        style={[styles.padBase, { width: padSize, height: padSize }]}
        {...panResponder.panHandlers}
      >
        {/* Crosshair guidelines */}
        <View style={styles.guideH} />
        <View style={styles.guideV} />

        {/* Movable Tactile Knob */}
        <View
          style={[
            styles.knob,
            {
              width: knobSize,
              height: knobSize,
              transform: [{ translateX: knobX }, { translateY: knobY }],
            },
          ]}
        >
          <View style={styles.knobInner} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 2,
  },
  hintText: {
    color: THEME.colors.textSecondary,
    fontSize: 9,
    marginBottom: 4,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  padBase: {
    borderRadius: 50,
    backgroundColor: THEME.colors.tealDark,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  guideH: {
    position: 'absolute',
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(145, 185, 167, 0.3)',
  },
  guideV: {
    position: 'absolute',
    height: '80%',
    width: 1,
    backgroundColor: 'rgba(145, 185, 167, 0.3)',
  },
  knob: {
    borderRadius: 20,
    backgroundColor: THEME.colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  knobInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.olive,
    borderWidth: 1,
    borderColor: THEME.colors.charcoal,
  },
});
