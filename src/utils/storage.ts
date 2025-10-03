import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  BEST_SCORE: 'fluffybird_best_score',
  SETTINGS: 'fluffybird_settings',
} as const;

export async function saveBestScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.BEST_SCORE, score.toString());
  } catch (error) {
    console.error('Failed to save best score:', error);
  }
}

export async function loadBestScore(): Promise<number> {
  try {
    const score = await AsyncStorage.getItem(KEYS.BEST_SCORE);
    return score ? parseInt(score, 10) : 0;
  } catch (error) {
    console.error('Failed to load best score:', error);
    return 0;
  }
}

export async function saveSettings(settings: Record<string, any>): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export async function loadSettings(): Promise<Record<string, any>> {
  try {
    const settings = await AsyncStorage.getItem(KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {};
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {};
  }
}
