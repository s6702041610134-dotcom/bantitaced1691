// components/app-tabs.tsx — bottom tab bar dressed as a gilded marquee rail

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { COLORS } from '@/app/_layout';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.curtainRed },
        headerTintColor: COLORS.gilt,
        headerTitleStyle: { fontFamily: 'CinzelDecorative_700Bold', fontSize: 18 },

        tabBarStyle: {
          backgroundColor: COLORS.curtainRedDark,
          borderTopWidth: 2,
          borderTopColor: COLORS.gilt,
          height: 68,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.giltBright,
        tabBarInactiveTintColor: '#B98F5C',
        tabBarLabelStyle: {
          fontFamily: 'EBGaramond_600SemiBold',
          fontSize: 11,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Box Office',
          headerTitle: () => (
            <Text
              style={{
                fontFamily: 'CinzelDecorative_700Bold',
                color: COLORS.gilt,
                fontSize: 18,
              }}
            >
              Apple iTunes
            </Text>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="preview"
        options={{
          title: 'On Stage',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
