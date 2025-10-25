import { useSoundStore } from "./soundStore";
import { useEffect } from "react";
//tiny sound hook for managing audio assets

export function useSound() {
    const ready = useSoundStore(state => state.ready);
    const toggleMute = useSoundStore(state => state.toggleMute);
    const setSfxVolume = useSoundStore(state => state.setSfxVolume);
    const setBgmVolume = useSoundStore(state => state.setBgmVolume);
    const playSound = useSoundStore(state => state.playSound);
    const playBgm = useSoundStore(state => state.playBgm);
    const stopBgm = useSoundStore(state => state.stopBgm);
    const pauseBgm = useSoundStore(state => state.pauseBgm);
    const unloadSounds = useSoundStore(state => state.unloadSounds);

}