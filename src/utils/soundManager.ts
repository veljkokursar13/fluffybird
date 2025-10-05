import { Audio } from 'expo-av';

let flapSound: Audio.Sound | null = null;

export async function loadSoundsOnce() {
  if (flapSound) return; // guard
  
  try {
    flapSound = new Audio.Sound();
    await flapSound.loadAsync(require('@assets/audio/wing_flap.wav'), { 
      shouldPlay: false 
    });
  } catch (e) {
    console.warn('load flap sound failed', e);
  }
}

export function playFlap() {
  if (!flapSound) return;
  
  flapSound.replayAsync().catch(e => 
    console.warn('flap replay failed', e)
  );
}

export async function unloadSounds() {
  try { 
    await flapSound?.unloadAsync(); 
  } catch (e) {
    console.warn('unload flap sound failed', e);
  }
  flapSound = null;
}
