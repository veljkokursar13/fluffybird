import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getAdUnitId } from './AdsManager';
import { Analytics_AdImpression, Analytics_AdFailed, Analytics_AdClick } from '@/src/analytics';

interface BannerAdProps {
  position?: 'top' | 'bottom';
  placement?: string;
}

const Banner: React.FC<BannerAdProps> = ({ position = 'bottom', placement = 'menu' }) => {
  const handleAdLoaded = () => {
    Analytics_AdImpression('banner', placement);
  };

  const handleAdFailedToLoad = (error: string) => {
    Analytics_AdFailed('banner', error);
    console.warn('Banner ad failed to load:', error);
  };

  const handleAdClicked = () => {
    Analytics_AdClick('banner', placement);
  };

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <BannerAd
        unitId={getAdUnitId('banner')}
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={(error: Error) => handleAdFailedToLoad(error.message)}
        onAdClicked={handleAdClicked}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});

export default Banner;