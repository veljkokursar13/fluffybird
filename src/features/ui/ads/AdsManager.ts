import { Platform } from 'react-native';
import { TestIds, InterstitialAd, RewardedAd, AdEventType } from 'react-native-google-mobile-ads';
import { Analytics_AdImpression, Analytics_AdFailed } from '@/src/analytics';

/**
 * Centralized Ads Manager for AdMob configuration
 */

export interface AdUnitIds {
  banner: string;
  interstitial: string;
  rewarded: string;
}

// Ad unit IDs configuration
// Replace with your actual ad unit IDs from AdMob console
const AD_UNIT_IDS: Record<'ios' | 'android', AdUnitIds> = {
  ios: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxx/xxxxx',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxx/xxxxx',
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxx/xxxxx',
  },
  android: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxx/xxxxx',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxx/xxxxx',
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxx/xxxxx',
  },
};

/**
 * Get ad unit ID for current platform
 */
export const getAdUnitId = (adType: keyof AdUnitIds): string => {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  return AD_UNIT_IDS[platform][adType];
}

/**
 * Interstitial ad manager
 */
export class InterstitialAdManager {
  private static interstitial: InterstitialAd | null = null;
  private static isLoaded = false;
  private static isLoading = false;

  private static createInterstitial() {
    if (!this.interstitial) {
      this.interstitial = InterstitialAd.createForAdRequest(getAdUnitId('interstitial'), {
        requestNonPersonalizedAdsOnly: true,
      });

      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isLoaded = true;
        this.isLoading = false;
      });

      this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isLoading = false;
        this.isLoaded = false;
        Analytics_AdFailed('interstitial', String(error));
        console.warn('Failed to load interstitial ad:', error);
      });

      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        // Preload next ad
        this.load();
      });
    }
  }

  static async load() {
    if (this.isLoading || this.isLoaded) return;
    
    this.isLoading = true;
    this.createInterstitial();
    this.interstitial?.load();
  }

  static async show(placement: string = 'game_over') {
    if (!this.isLoaded) {
      await this.load();
      // Wait a bit for the ad to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (this.isLoaded && this.interstitial) {
      try {
        this.interstitial.show();
        Analytics_AdImpression('interstitial', placement);
      } catch (error) {
        console.warn('Failed to show interstitial ad:', error);
      }
    }
  }
}

/**
 * Rewarded ad manager
 */
export class RewardedAdManager {
  private static rewarded: RewardedAd | null = null;
  private static isLoaded = false;
  private static isLoading = false;

  private static createRewarded() {
    if (!this.rewarded) {
      this.rewarded = RewardedAd.createForAdRequest(getAdUnitId('rewarded'), {
        requestNonPersonalizedAdsOnly: true,
      });

      this.rewarded.addAdEventListener(AdEventType.LOADED, () => {
        this.isLoaded = true;
        this.isLoading = false;
      });

      this.rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        this.isLoading = false;
        this.isLoaded = false;
        Analytics_AdFailed('rewarded', String(error));
        console.warn('Failed to load rewarded ad:', error);
      });

      this.rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        this.isLoaded = false;
        // Preload next ad
        this.load();
      });
    }
  }

  static async load() {
    if (this.isLoading || this.isLoaded) return;
    
    this.isLoading = true;
    this.createRewarded();
    this.rewarded?.load();
  }

  static async show(placement: string = 'extra_life'): Promise<boolean> {
    if (!this.isLoaded) {
      await this.load();
      // Wait a bit for the ad to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (this.isLoaded && this.rewarded) {
      try {
        this.rewarded.show();
        Analytics_AdImpression('rewarded', placement);
        return true;
      } catch (error) {
        console.warn('Failed to show rewarded ad:', error);
        return false;
      }
    }
    return false;
  }

  static isReady(): boolean {
    return this.isLoaded;
  }
}

/**
 * Ad frequency controller to avoid showing ads too often
 */
export class AdFrequencyController {
  private static lastInterstitialTime = 0;
  private static gamesSinceLastAd = 0;
  
  // Show interstitial every N games or M seconds
  private static MIN_GAMES_BETWEEN_ADS = 3;
  private static MIN_SECONDS_BETWEEN_ADS = 120; // 2 minutes

  static shouldShowInterstitial(): boolean {
    const now = Date.now();
    const timeSinceLastAd = (now - this.lastInterstitialTime) / 1000;
    
    const timeCondition = timeSinceLastAd >= this.MIN_SECONDS_BETWEEN_ADS;
    const gamesCondition = this.gamesSinceLastAd >= this.MIN_GAMES_BETWEEN_ADS;

    return timeCondition && gamesCondition;
  }

  static markGamePlayed() {
    this.gamesSinceLastAd++;
  }

  static markAdShown() {
    this.lastInterstitialTime = Date.now();
    this.gamesSinceLastAd = 0;
  }

  static reset() {
    this.lastInterstitialTime = 0;
    this.gamesSinceLastAd = 0;
  }
}

