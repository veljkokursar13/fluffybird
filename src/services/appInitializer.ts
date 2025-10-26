import { initializeAds, InterstitialAdManager, RewardedAdManager } from '@src/features/ui/ads';
import { logScreenView } from '@src/analytics';

/**
 * Initialize all app services on startup
 * Call this once in your root layout or app entry
 */
export const initializeAppServices = async () => {
  try {
    // Initialize ads system
    await initializeAds();
    
    // Preload first interstitial ad
    InterstitialAdManager.load();
    
    // Preload first rewarded ad
    RewardedAdManager.load();
    
    console.log('App services initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize app services:', error);
  }
};

/**
 * Track screen navigation for analytics
 */
export const trackScreen = (screenName: string, screenClass?: string) => {
  logScreenView(screenName, screenClass);
};

