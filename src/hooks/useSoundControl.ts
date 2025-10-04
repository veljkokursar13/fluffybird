// src/hooks/useSoundControl.ts
import { useMemo } from 'react';
import { useSoundSetting } from './useSoundSetting';

type UseSoundControl = {
  muted: boolean;
  toggleMuted: () => Promise<void>;
  accessibilityLabel: string;
};

export function useSoundControl(): UseSoundControl {
  const [muted, toggleMuted] = useSoundSetting(); // global + persistent [[memory:9582142]]
  const accessibilityLabel = useMemo(() => (muted ? 'Unmute sound' : 'Mute sound'), [muted]);
  return { muted, toggleMuted, accessibilityLabel };
}
export default useSoundControl;