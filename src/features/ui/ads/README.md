# Ads & Analytics Integration Guide

## Overview
Complete AdMob and Firebase Analytics setup for Fluffy Bird.

## File Structure
```
src/
├── analytics/
│   ├── firebaseAnalytics.ts    # Analytics utilities
│   └── index.ts
├── features/ui/ads/
│   ├── AdsManager.ts            # Centralized ad configuration
│   ├── Banner.tsx               # Banner ad component
│   ├── useInterstitialAd.ts    # Interstitial hook
│   ├── useRewardedAd.ts        # Rewarded ad hook
│   └── index.ts
└── services/
    └── appInitializer.ts       # App startup initialization
```

## Setup Instructions

### 1. Configure Ad Unit IDs
Edit `src/features/ui/ads/AdsManager.ts` and replace placeholder IDs:

```typescript
const AD_UNIT_IDS: Record<'ios' | 'android', AdUnitIds> = {
  ios: {
    banner: 'ca-app-pub-YOUR_ID/YOUR_BANNER_ID',
    interstitial: 'ca-app-pub-YOUR_ID/YOUR_INTERSTITIAL_ID',
    rewarded: 'ca-app-pub-YOUR_ID/YOUR_REWARDED_ID',
  },
  android: {
    banner: 'ca-app-pub-YOUR_ID/YOUR_BANNER_ID',
    interstitial: 'ca-app-pub-YOUR_ID/YOUR_INTERSTITIAL_ID',
    rewarded: 'ca-app-pub-YOUR_ID/YOUR_REWARDED_ID',
  },
};
```

### 2. Initialize on App Startup
In `app/_layout.tsx`, add initialization:

```typescript
import { useEffect } from 'react';
import { initializeAppServices } from '@src/services/appInitializer';

export default function RootLayout() {
  useEffect(() => {
    initializeAppServices();
  }, []);
  
  // ... rest of layout
}
```

### 3. Firebase Configuration
Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) to your project root.

Update `app.json`:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## Usage Examples

### Banner Ads
Already integrated in `app/index.tsx`:
```typescript
import Banner from '@src/features/ui/ads/Banner';

<Banner position="bottom" placement="menu" />
```

For game screen:
```typescript
<Banner position="top" placement="game" />
```

### Interstitial Ads (Game Over)
In `src/features/ui/overlays/GameOverOverlay.tsx`:

```typescript
import { useInterstitialAd } from '@src/features/ui/ads';
import { AdFrequencyController } from '@src/features/ui/ads';

function GameOverOverlay() {
  const { showAdWithFrequency } = useInterstitialAd();

  const handleGameOver = () => {
    // Mark game played for frequency control
    AdFrequencyController.markGamePlayed();
    
    // Show ad if frequency conditions met
    showAdWithFrequency('game_over');
  };
  
  // ... rest of component
}
```

### Rewarded Ads (Extra Life/Continue)
Create a "Watch Ad to Continue" button:

```typescript
import { useRewardedAd } from '@src/features/ui/ads';

function GameOverOverlay() {
  const { isReady, showAd } = useRewardedAd();

  const handleWatchAdForExtraLife = async () => {
    const rewarded = await showAd('extra_life');
    if (rewarded) {
      // Grant extra life
      resetGame();
    }
  };

  return (
    <View>
      {isReady && (
        <TouchableOpacity onPress={handleWatchAdForExtraLife}>
          <Text>Watch Ad for Extra Life</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

## Analytics Integration

### Track Game Events
In `src/features/game/GameContainer.tsx`:

```typescript
import { 
  Analytics_GameStart, 
  Analytics_GameOver, 
  Analytics_GamePause,
  Analytics_HighScore 
} from '@src/analytics';

// On game start
useEffect(() => {
  Analytics_GameStart();
}, []);

// On game over
const handleGameOver = (score: number, bestScore: number) => {
  const isHighScore = score > bestScore;
  Analytics_GameOver(score, isHighScore);
  
  if (isHighScore) {
    Analytics_HighScore(score);
  }
};

// On pause
const handlePause = () => {
  Analytics_GamePause();
};
```

### Track UI Interactions
In buttons/components:

```typescript
import { Analytics_ButtonClick } from '@src/analytics';

const handlePress = () => {
  Analytics_ButtonClick('start_game', 'menu');
  router.push('/game');
};
```

## Ad Frequency Control

Default settings in `AdsManager.ts`:
- Show interstitial every **3 games** OR every **2 minutes**
- Adjust in `AdFrequencyController`:

```typescript
private static MIN_GAMES_BETWEEN_ADS = 3;
private static MIN_SECONDS_BETWEEN_ADS = 120;
```

## Testing

### Development Mode
- Test ads automatically load (Google's test ad units)
- No need for real ad units during development
- Set test device IDs in `AdsManager.ts`:

```typescript
await setTestDeviceIDAsync('YOUR_TEST_DEVICE_ID');
```

### Find Test Device ID
Check console logs when running app - AdMob prints test device ID.

## Best Practices

1. **Banner Placement**: Menu screen (bottom) for best UX
2. **Interstitial Timing**: Game over screen only, with frequency control
3. **Rewarded Ads**: Optional features (extra life, hints, power-ups)
4. **Analytics**: Track all major user actions for insights
5. **GDPR Compliance**: Currently using `servePersonalizedAds: false`

## Common Issues

### Ads not showing
- Check ad unit IDs are correct
- Ensure `initializeAppServices()` is called
- Check console for error messages
- Verify Firebase/AdMob setup in app.json

### Analytics not working
- Ensure google-services files are in place
- Check Firebase Console for real-time events
- Events may take 24h to appear in reports

## Next Steps

1. ✅ Replace ad unit IDs with your AdMob IDs
2. ✅ Add Firebase config files
3. ✅ Initialize in `_layout.tsx`
4. ✅ Add interstitial to game over screen
5. ✅ Add rewarded ad for extra life (optional)
6. ✅ Test in development mode
7. ✅ Test on real device before production

