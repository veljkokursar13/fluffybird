import { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameStore } from '../store/gameStore';

const KEY = 'soundMuted';

export function useSoundSetting(): readonly [boolean, () => Promise<void>] {
  const muted = useGameStore((s) => s.muted);
  const setMuted = useGameStore((s) => s.setMuted);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw != null) setMuted(raw === 'true');
      } catch {}
    })();
  }, []);

  const toggleMuted = useCallback(async () => {
    const next = !muted;
    setMuted(next);
    try {
      await AsyncStorage.setItem(KEY, next ? 'true' : 'false');
    } catch {}
  }, [muted, setMuted]);

  return [muted, toggleMuted] as const;
}