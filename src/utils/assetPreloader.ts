import { Asset } from 'expo-asset';

const FONT_PRELOAD = [
  require('@assets/fonts/fff-forward.regular.ttf'),
  require('@assets/fonts/IrishGrover-Regular.ttf'),
  require('@assets/fonts/PressStart2P-Regular.ttf'),
];
// All game assets centralized for preloading
const GAME_ASSETS = [
  // Bird assets
  require('@assets/images/birdmain.png'),
  require('@assets/images/wingbottom.png'),
  require('@assets/images/wingup.png'),
  require('@assets/images/wingcenterupper.png'),
  // Pipe assets
  require('@assets/images/pipebody.png'),
  require('@assets/images/pipecapnewnew.png'),
  // Cloud assets
  require('@assets/images/cloudnew.png'),
  require('@assets/images/cloudmedium.png'),
  // World/environment assets
  require('@assets/images/groundnew.png'),
  require('@assets/images/sun.png'),
  require('@assets/images/bushes.png'),
  require('@assets/images/citybg.png'),
  //menu page assets
  require('@assets/images/bird-for-menu.png'),
  require('@assets/images/city-background.png'),
];

/**
 * Preload all game assets to ensure smooth gameplay.
 * Call this before rendering any game components.
 */
export async function preloadGameAssets(): Promise<boolean> {
  try {
    await Asset.loadAsync(GAME_ASSETS);
    console.log('✅ All game assets preloaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Asset preload error:', error);
    return false;
  }
}

