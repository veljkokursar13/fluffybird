import { useEffect, useState } from 'react';
import { RewardedAdManager } from './AdsManager';

/**
 * Hook to manage rewarded ads
 * Returns ready state and show function
 */
export const useRewardedAd = (preload: boolean = true) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (preload) {
      RewardedAdManager.load().then(() => {
        setIsReady(RewardedAdManager.isReady());
      });
    }
  }, [preload]);

  const showAd = async (placement?: string): Promise<boolean> => {
    const rewarded = await RewardedAdManager.show(placement);
    setIsReady(RewardedAdManager.isReady());
    return rewarded;
  };

  const checkReady = () => {
    const ready = RewardedAdManager.isReady();
    setIsReady(ready);
    return ready;
  };

  return { isReady, showAd, checkReady };
};

