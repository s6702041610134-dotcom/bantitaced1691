import {
  IndieFlower_400Regular,
  useFonts as useIndieFlower,
} from '@expo-google-fonts/indie-flower';
import {
  PlaywriteDELAGuides_400Regular,
  useFonts as usePlaywrite,
} from '@expo-google-fonts/playwrite-de-la-guides';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [indieLoaded] = useIndieFlower({ IndieFlower_400Regular });
  const [playwriteLoaded] = usePlaywrite({ PlaywriteDELAGuides_400Regular });
  const fontsLoaded = indieLoaded && playwriteLoaded;

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const createTable = async (db: SQLiteDatabase) => {
    // Create table with full schema
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        title     TEXT    NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        due_date  TEXT,
        notes     TEXT
      );
    `);
    // Silent migration: add new columns to existing DB if upgrading
    try { await db.execAsync(`ALTER TABLE todos ADD COLUMN due_date TEXT`); } catch (_) {}
    try { await db.execAsync(`ALTER TABLE todos ADD COLUMN notes TEXT`); } catch (_) {}
  };

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#313e1b' }} />;
  }

  return (
    <SQLiteProvider
      databaseName="todos.db"
      onInit={createTable}
      options={{ useNewConnection: false }}
    >
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#435525' },
          headerTintColor: '#f4f2ed',
          headerTitleStyle: {
            fontFamily: 'PlaywriteDELAGuides_400Regular',
            fontSize: 16,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index"    options={{ title: 'My Todos' }} />
        <Stack.Screen name="calendar" options={{ title: 'Calendar' }} />
      </Stack>
    </SQLiteProvider>
  );
}
