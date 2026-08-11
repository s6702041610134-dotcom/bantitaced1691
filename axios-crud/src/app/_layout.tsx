import BottomNavDrawer from "@/components/BottomNavDrawer";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// On Web, use standard View to avoid React 19 NativeSafeAreaProvider DOM crash
const SafeProvider = Platform.OS === "web" ? View : SafeAreaProvider;

export default function RootLayout() {
  return (
    <SafeProvider style={{ flex: 1 }}>
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
    </SafeProvider>
  );
}