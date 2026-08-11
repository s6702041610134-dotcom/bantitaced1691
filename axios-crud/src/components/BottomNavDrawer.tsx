import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type DrawerLink = {
  label: string;
  icon: string;
  path: string;
};

const LINKS: DrawerLink[] = [
  { label: "HOME / DIRECTORY", icon: "🏠", path: "/" },
  { label: "ADD NEW PHONE", icon: "🕸️", path: "/addPhone" },
];

export default function BottomNavDrawer() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web', // Use native driver on native platforms, not on web
      damping: 18,
      stiffness: 160,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 180, // Adjust duration as needed
      useNativeDriver: Platform.OS !== 'web', // Use native driver on native platforms, not on web
    }).start(() => setVisible(false));
  };

  const goTo = (path: string) => {
    closeDrawer();
    setTimeout(() => router.push(path as any), 150);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [260, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.55],
  });

  return (
    <>
      {/* Floating Trigger Button */}
      <View style={styles.triggerWrapper} pointerEvents="box-none">
        <Pressable
          onPress={openDrawer}
          style={({ pressed }) => [
            styles.triggerBtn,
            pressed && styles.triggerBtnPressed,
          ]}
        >
          <Text style={styles.triggerIcon}>🕷️</Text>
          <Text style={styles.triggerLabel}>MENU</Text>
        </Pressable>
      </View>

      {/* Backdrop + Drawer */}
      {visible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
          </Animated.View>

          <Animated.View
            style={[styles.drawer, { transform: [{ translateY }] }]}
          >
            <View style={styles.dragHandle} />

            <Text style={styles.drawerTitle}>NAVIGATE BLUEPRINT</Text>
            <Text style={styles.drawerSubtitle}>SELECT DESTINATION SPEC</Text>

            <View style={styles.linksGroup}>
              {LINKS.map((link) => (
                <Pressable
                  key={link.path}
                  onPress={() => goTo(link.path)}
                  style={({ pressed }) => [
                    styles.linkRow,
                    pressed && styles.linkRowPressed,
                  ]}
                >
                  <Text style={styles.linkIcon}>{link.icon}</Text>
                  <Text style={styles.linkLabel}>{link.label}</Text>
                  <Text style={styles.linkArrow}>›</Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={closeDrawer} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  triggerWrapper: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
  },
  triggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D8232A",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#F4D976",
    elevation: 6,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 14px rgba(0,0,0,0.45)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
        }),
  },
  triggerBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  triggerIcon: {
    fontSize: 16,
  },
  triggerLabel: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#103565",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    borderColor: "#4E86C7",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  dragHandle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4E86C7",
    marginBottom: 12,
    opacity: 0.6,
  },
  drawerTitle: {
    color: "#D8232A",
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: 1,
  },
  drawerSubtitle: {
    color: "#F4D976",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.5,
    marginTop: 2,
    marginBottom: 16,
  },
  linksGroup: {
    gap: 10,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B264A",
    borderWidth: 1,
    borderColor: "#2A6BC260",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  linkRowPressed: {
    backgroundColor: "#0B264A90",
    borderColor: "#F4D976",
  },
  linkIcon: {
    fontSize: 18,
  },
  linkLabel: {
    flex: 1,
    color: "#EAF2FB",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 1,
  },
  linkArrow: {
    color: "#4E86C7",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 10,
  },
  closeBtnText: {
    color: "#EAF2FB80",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 1.5,
  },
});