import BottomNavDrawer from "@/components/BottomNavDrawer";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context"; // 1. Import เข้ามา

export default function RootLayout() {
  return (
    <SafeAreaProvider> {/* 2. ครอบแอปทั้งหมดไว้ที่ Root */}
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
    </SafeAreaProvider>
  );
}