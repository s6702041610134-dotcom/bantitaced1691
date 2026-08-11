import BottomNavDrawer from "@/components/BottomNavDrawer";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const content = (
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
  );

  // On Web, return pure View to bypass NativeSafeAreaProvider completely
  if (Platform.OS === "web") {
    return content;
  }

  return <SafeAreaProvider>{content}</SafeAreaProvider>;
}