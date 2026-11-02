import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserGameProgress, UserSettings } from '../engine/types';

const PROGRESS_STORAGE_KEY = '@tilt_maze_progress_v1';
const SETTINGS_STORAGE_KEY = '@tilt_maze_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  sensitivity: 1.25,
  filterAlpha: 0.85,
  hapticsEnabled: true,
  soundEnabled: true,
  virtualPadEnabled: false,
  calibratedOffset: { x: 0, y: 0 },
};

export const DEFAULT_PROGRESS: UserGameProgress = {
  unlockedLevels: [1],
  highScores: {},
  starsEarned: {},
  bestTimes: {},
};

export class GameStorage {
  public static async loadProgress(): Promise<UserGameProgress> {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load game progress:', e);
    }
    return DEFAULT_PROGRESS;
  }

  public static async saveProgress(progress: UserGameProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save game progress:', e);
    }
  }

  public static async loadSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public static async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  public static async recordLevelCompletion(
    levelId: number,
    stars: number,
    score: number,
    timeSeconds: number
  ): Promise<UserGameProgress> {
    const progress = await this.loadProgress();

    // 1. Unlock next level
    const nextLevel = levelId + 1;
    if (!progress.unlockedLevels.includes(nextLevel)) {
      progress.unlockedLevels.push(nextLevel);
    }

    // 2. Update stars if higher
    const currentStars = progress.starsEarned[levelId] || 0;
    if (stars > currentStars) {
      progress.starsEarned[levelId] = stars;
    }

    // 3. Update high score if higher
    const currentScore = progress.highScores[levelId] || 0;
    if (score > currentScore) {
      progress.highScores[levelId] = score;
    }

    // 4. Update best time if faster
    const currentBestTime = progress.bestTimes[levelId];
    if (currentBestTime === undefined || timeSeconds < currentBestTime) {
      progress.bestTimes[levelId] = timeSeconds;
    }

    await this.saveProgress(progress);
    return progress;
  }
}
