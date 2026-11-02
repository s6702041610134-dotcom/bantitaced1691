import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LEVELS } from '../data/levels';
import { GameStorage, DEFAULT_PROGRESS } from '../store/gameStore';
import { UserGameProgress } from '../engine/types';
import { LevelCard } from '../components/LevelCard';
import { THEME } from '../constants/theme';

export default function LevelsScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserGameProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    GameStorage.loadProgress().then(setProgress);
  }, []);

  const totalStarsEarned = Object.values(progress.starsEarned).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Device Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={THEME.colors.charcoal} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>MATRIX SECTOR SELECT</Text>

        <View style={styles.starsPill}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.starsCountText}>{totalStarsEarned}</Text>
        </View>
      </View>

      {/* Levels List */}
      <ScrollView
        contentContainerStyle={styles.scrollList}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionNotice}>
          <Text style={styles.sectionSubtitle}>
            [SELECT TEST SECTOR // ACCELEROMETER VECTOR GRID]
          </Text>
        </View>

        {LEVELS.map(level => {
          const isUnlocked = progress.unlockedLevels.includes(level.id);
          const starsEarned = progress.starsEarned[level.id] || 0;
          const highScore = progress.highScores[level.id];
          const bestTime = progress.bestTimes[level.id];

          return (
            <LevelCard
              key={`level_card_${level.id}`}
              level={level}
              isUnlocked={isUnlocked}
              starsEarned={starsEarned}
              highScore={highScore}
              bestTime={bestTime}
              onSelect={() => router.push(`/game/${level.id}`)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.ivory,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.charcoal,
    backgroundColor: THEME.colors.paper,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: THEME.colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.charcoal,
    letterSpacing: 1,
  },
  starsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.ivory,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.colors.charcoal,
  },
  starIcon: {
    fontSize: 12,
    color: THEME.colors.accentGold,
  },
  starsCountText: {
    color: THEME.colors.charcoal,
    fontSize: 12,
    fontWeight: '900',
  },
  scrollList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionNotice: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
