import * as Analytics from 'expo-firebase-analytics';

/**
 * Firebase Analytics wrapper for consistent event tracking
 */

// Analytics events enum for type safety
export enum AnalyticsEvent {
  // Game events
  GAME_START = 'game_start',
  GAME_OVER = 'game_over',
  GAME_PAUSE = 'game_pause',
  GAME_RESUME = 'game_resume',
  
  // Score events
  HIGH_SCORE = 'high_score_achieved',
  SCORE_MILESTONE = 'score_milestone',
  
  // UI events
  BUTTON_CLICK = 'button_click',
  SCREEN_VIEW = 'screen_view',
  
  // Sound events
  SOUND_TOGGLE = 'sound_toggle',
  
  // Ad events
  AD_IMPRESSION = 'ad_impression',
  AD_CLICK = 'ad_click',
  AD_FAILED = 'ad_failed_to_load',
  
  // Purchase events
  PURCHASE_INITIATED = 'purchase_initiated',
  PURCHASE_SUCCESS = 'purchase_success',
  PURCHASE_FAILED = 'purchase_failed',
}

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Log a custom analytics event
 */
export const logEvent = async (eventName: AnalyticsEvent | string, params?: EventParams) => {
  try {
    await Analytics.logEvent(eventName, params);
  } catch (error) {
    console.warn('Analytics error:', error);
  }
};

/**
 * Log screen view
 */
export const logScreenView = async (screenName: string, screenClass?: string) => {
  try {
    await Analytics.setCurrentScreen(screenName, screenClass);
    await logEvent(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.warn('Analytics screen view error:', error);
  }
};

/**
 * Set user property
 */
export const setUserProperty = async (name: string, value: string) => {
  try {
    await Analytics.setUserProperty(name, value);
  } catch (error) {
    console.warn('Analytics user property error:', error);
  }
};

/**
 * Set user ID for tracking
 */
export const setUserId = async (userId: string) => {
  try {
    await Analytics.setUserId(userId);
  } catch (error) {
    console.warn('Analytics user ID error:', error);
  }
};

// Game-specific analytics helpers
export const Analytics_GameStart = () => logEvent(AnalyticsEvent.GAME_START);

export const Analytics_GameOver = (score: number, highScore: boolean) => 
  logEvent(AnalyticsEvent.GAME_OVER, { score, high_score: highScore });

export const Analytics_GamePause = () => logEvent(AnalyticsEvent.GAME_PAUSE);

export const Analytics_GameResume = () => logEvent(AnalyticsEvent.GAME_RESUME);

export const Analytics_HighScore = (score: number) => 
  logEvent(AnalyticsEvent.HIGH_SCORE, { score });

export const Analytics_ScoreMilestone = (milestone: number) => 
  logEvent(AnalyticsEvent.SCORE_MILESTONE, { milestone });

export const Analytics_SoundToggle = (muted: boolean) => 
  logEvent(AnalyticsEvent.SOUND_TOGGLE, { muted });

export const Analytics_ButtonClick = (buttonName: string, screen: string) => 
  logEvent(AnalyticsEvent.BUTTON_CLICK, { button_name: buttonName, screen });

// Ad-specific analytics
export const Analytics_AdImpression = (adType: 'banner' | 'interstitial' | 'rewarded', placement: string) => 
  logEvent(AnalyticsEvent.AD_IMPRESSION, { ad_type: adType, placement });

export const Analytics_AdClick = (adType: 'banner' | 'interstitial' | 'rewarded', placement: string) => 
  logEvent(AnalyticsEvent.AD_CLICK, { ad_type: adType, placement });

export const Analytics_AdFailed = (adType: 'banner' | 'interstitial' | 'rewarded', error: string) => 
  logEvent(AnalyticsEvent.AD_FAILED, { ad_type: adType, error });

