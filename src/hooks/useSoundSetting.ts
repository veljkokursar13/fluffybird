import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'soundMuted';

export function useSoundSetting(): readonly [boolean, () => Promise<void>] {
  const [muted, setMuted] = useState(false);

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
  }, [muted]);

  return [muted, toggleMuted] as const;
}