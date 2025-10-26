import { useEffect } from 'react';
import { InterstitialAdManager, AdFrequencyController } from './AdsManager';

/**
 * Hook to manage interstitial ads
 * Preloads ad on mount for faster display
 */
export const useInterstitialAd = (preload: boolean = true) => {
  useEffect(() => {
    if (preload) {
      InterstitialAdManager.load();
    }
  }, [preload]);

  const showAd = async (placement?: string) => {
    await InterstitialAdManager.show(placement);
  };

  const showAdWithFrequency = async (placement?: string) => {
    if (AdFrequencyController.shouldShowInterstitial()) {
      await InterstitialAdManager.show(placement);
      AdFrequencyController.markAdShown();
    }
  };

  return { showAd, showAdWithFrequency };
};

