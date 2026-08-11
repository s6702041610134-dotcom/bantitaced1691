import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function MetallicSpiderBg({ children }: Props) {
  // Web-specific gradient inline style
  const webGradientStyle = Platform.OS === "web"
    ? ({
        background:
          "radial-gradient(circle at 50% 30%, #1A467B 0%, #0F294D 45%, #050D1A 95%)",
      } as ViewStyle)
    : null;

  return (
    <View style={styles.container}>
      {/* Background Metallic Shader Layer */}
      <View style={[styles.gradientShader, webGradientStyle]} />

      {/* Spiderweb Lines Layer - Top Left Web */}
      <View style={[styles.spiderWebCorner, styles.topLeftWeb, { pointerEvents: "none" }]}>
        <View style={styles.webSpoke1} />
        <View style={styles.webSpoke2} />
        <View style={styles.webSpoke3} />
        <View style={styles.webSpoke4} />
        <View style={[styles.webRing, { width: 60, height: 60, borderRadius: 30 }]} />
        <View style={[styles.webRing, { width: 120, height: 120, borderRadius: 60 }]} />
        <View style={[styles.webRing, { width: 180, height: 180, borderRadius: 90 }]} />
        <View style={[styles.webRing, { width: 240, height: 240, borderRadius: 120 }]} />
        <View style={[styles.webRing, { width: 300, height: 300, borderRadius: 150 }]} />
      </View>

      {/* Spiderweb Lines Layer - Top Right Web */}
      <View style={[styles.spiderWebCorner, styles.topRightWeb, { pointerEvents: "none" }]}>
        <View style={styles.webSpoke1} />
        <View style={styles.webSpoke2} />
        <View style={styles.webSpoke3} />
        <View style={styles.webSpoke4} />
        <View style={[styles.webRing, { width: 80, height: 80, borderRadius: 40 }]} />
        <View style={[styles.webRing, { width: 150, height: 150, borderRadius: 75 }]} />
        <View style={[styles.webRing, { width: 220, height: 220, borderRadius: 110 }]} />
        <View style={[styles.webRing, { width: 290, height: 290, borderRadius: 145 }]} />
      </View>

      {/* Spiderweb Lines Layer - Bottom Center Web */}
      <View style={[styles.spiderWebCorner, styles.bottomCenterWeb, { pointerEvents: "none" }]}>
        <View style={styles.webSpoke1} />
        <View style={styles.webSpoke2} />
        <View style={styles.webSpoke3} />
        <View style={styles.webSpoke4} />
        <View style={[styles.webRing, { width: 100, height: 100, borderRadius: 50 }]} />
        <View style={[styles.webRing, { width: 200, height: 200, borderRadius: 100 }]} />
        <View style={[styles.webRing, { width: 320, height: 320, borderRadius: 160 }]} />
      </View>

      {/* Content Container */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#081324",
    position: "relative",
  },
  gradientShader: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#0B1D36",
  },
  spiderWebCorner: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.25,
  },
  topLeftWeb: {
    top: -50,
    left: -50,
  },
  topRightWeb: {
    top: -40,
    right: -40,
  },
  bottomCenterWeb: {
    bottom: -80,
    alignSelf: "center",
  },
  webRing: {
    position: "absolute",
    borderWidth: 1.2,
    borderColor: "#EAF2FB",
    borderStyle: "solid",
  },
  webSpoke1: {
    position: "absolute",
    width: 350,
    height: 1.2,
    backgroundColor: "#EAF2FB",
    transform: [{ rotate: "0deg" }],
  },
  webSpoke2: {
    position: "absolute",
    width: 350,
    height: 1.2,
    backgroundColor: "#EAF2FB",
    transform: [{ rotate: "45deg" }],
  },
  webSpoke3: {
    position: "absolute",
    width: 350,
    height: 1.2,
    backgroundColor: "#EAF2FB",
    transform: [{ rotate: "90deg" }],
  },
  webSpoke4: {
    position: "absolute",
    width: 350,
    height: 1.2,
    backgroundColor: "#EAF2FB",
    transform: [{ rotate: "135deg" }],
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});