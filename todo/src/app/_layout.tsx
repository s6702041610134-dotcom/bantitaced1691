// app/_layout.tsx — root layout, themed to match the "Wonderful Showtime" palette
// instead of the stock DarkTheme / DefaultTheme.

import { Theme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

// ---- Design tokens: "Wonderful Showtime" palette (shared across the app) ----
export const COLORS = {
  curtainRed: '#7A1B2E',
  curtainRedDark: '#5C1220',
  gilt: '#C9A227',
  giltBright: '#E8C765',
  parchment: '#F3E7C9',
  ink: '#241512',
  ivory: '#F6EFDD',
};

// A custom navigation theme replaces Default/Dark so every screen, header,
// and tab bar inherits the curtain-red + gilt palette automatically.
const ShowtimeLightTheme: Theme = {
  dark: false,
  colors: {
    primary: COLORS.gilt,
    background: COLORS.curtainRed,
    card: COLORS.curtainRedDark,
    text: COLORS.ivory,
    border: COLORS.gilt,
    notification: COLORS.giltBright,
  },
  fonts: {
    regular: { fontFamily: 'EBGaramond_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'EBGaramond_600SemiBold', fontWeight: '600' },
    bold: { fontFamily: 'CinzelDecorative_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'CinzelDecorative_900Black', fontWeight: '900' },
  },
};

// Same palette for dark mode — the theater doesn't change color when the
// house lights go down, it just deepens.
const ShowtimeDarkTheme: Theme = {
  ...ShowtimeLightTheme,
  dark: true,
  colors: {
    ...ShowtimeLightTheme.colors,
    background: COLORS.curtainRedDark,
    card: '#3d0c14',
  },
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? ShowtimeDarkTheme : ShowtimeLightTheme}
    >
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
