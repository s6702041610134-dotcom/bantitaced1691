import BottomNavDrawer from "@/components/BottomNavDrawer";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import { Metrics, SafeAreaProvider } from "react-native-safe-area-context";

// กำหนดค่าเริ่มต้นสำหรับ Web เพื่อให้ Child components ใช้งานได้ปกติโดยไม่พัง
const WEB_INITIAL_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={Platform.OS === "web" ? WEB_INITIAL_METRICS : undefined}>
      <View style={{ flex: 1, backgroundColor: "#081324" }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#081324" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="addPhone" />
          <Stack.Screen name="editPhone" />
          <Stack.Screen name="phoneDetail" />
        </Stack>
        <BottomNavDrawer />
      </View>
    </SafeAreaProvider>
  );
}