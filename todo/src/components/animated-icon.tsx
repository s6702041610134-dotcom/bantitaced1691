// components/animated-icon.tsx — the house curtains part before the app opens
// Sits on top of the native splash screen, then fades itself out once
// expo-splash-screen has hidden and the curtain animation has finished.

import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  curtainRed: '#7A1B2E',
  curtainRedDark: '#5C1220',
  gilt: '#C9A227',
  giltBright: '#E8C765',
};

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const leftCurtain = useRef(new Animated.Value(0)).current;
  const rightCurtain = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Let the title glow in first, curtain-call style.
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start();

      await SplashScreen.hideAsync();

      // Then the gold curtains draw apart.
      Animated.parallel([
        Animated.timing(leftCurtain, {
          toValue: 1,
          duration: 650,
          delay: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rightCurtain, {
          toValue: 1,
          duration: 650,
          delay: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (cancelled) return;
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { opacity: overlayOpacity }]}
    >
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
            transform: [
              {
                translateY: titleOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        Wonderful Showtime
      </Animated.Text>

      <Animated.View
        style={[
          styles.curtainPanel,
          styles.left,
          {
            transform: [
              {
                translateX: leftCurtain.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -400],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.curtainPanel,
          styles.right,
          {
            transform: [
              {
                translateX: rightCurtain.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 400],
                }),
              },
            ],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: COLORS.curtainRedDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    fontFamily: 'CinzelDecorative_700Bold',
    color: COLORS.gilt,
    fontSize: 22,
    letterSpacing: 1,
    zIndex: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 6,
  },
  curtainPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '55%',
    backgroundColor: COLORS.curtainRed,
    borderColor: COLORS.giltBright,
    zIndex: 2,
  },
  left: {
    left: 0,
    borderRightWidth: 3,
  },
  right: {
    right: 0,
    borderLeftWidth: 3,
  },
});
