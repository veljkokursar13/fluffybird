import { create } from 'zustand';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer, AudioSource } from 'expo-audio';
import fluffySoundtrack from '@assets/audio/fluffy-soundtrack.wav';
import gameplaySound from '@assets/audio/gameplaysound.mp3';
import wingFlap from '@assets/audio/wing_flap.wav';

type SoundNames = 'fluffy-soundtrack' | 'gameplaysound' | 'wing_flap';

type LoadedSounds = Record<SoundNames, AudioPlayer>;

type SoundState = {
    ready: boolean;
    muted: boolean;
    sfxVolume: number;
    bgmVolume: number;
    sounds: Partial<LoadedSounds>;
    init: () => Promise<void>;
    toggleMute: () => void;
    setSfxVolume: (volume: number) => void;
    setBgmVolume: (volume: number) => void;
    playSound: (name: SoundNames) => void;
    playBgm: (name: SoundNames) => void;
    stopBgm: () => void;
    pauseBgm: () => void;
    unloadSounds: () => void;
}
//we should preload the sounds here once the app is loaded
const sources: Record<SoundNames, AudioSource> = {
    'fluffy-soundtrack': fluffySoundtrack,
    'gameplaysound': gameplaySound,
    'wing_flap': wingFlap,
}

export const useSoundStore = create<SoundState>((set, get) => ({
    ready: false,
    muted: false,
    sfxVolume: 1,
    bgmVolume: 1,
    sounds: {},

    init: async () => {
        if (get().ready) return;

        await setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: false,
            interruptionMode: 'doNotMix',
            interruptionModeAndroid: 'duckOthers',
            shouldPlayInBackground: false,
        });

        const loaded: Partial<LoadedSounds> = {};
        (Object.keys(sources) as SoundNames[]).forEach((name) => {
            const isSfx = name !== 'fluffy-soundtrack';
            const player = createAudioPlayer(sources[name] as AudioSource, isSfx ? { keepAudioSessionActive: true } : undefined);
            player.loop = false;
            player.muted = get().muted;
            player.volume = name === 'fluffy-soundtrack' ? get().bgmVolume : get().sfxVolume;
            loaded[name] = player;
        });

        set({ sounds: loaded, ready: true });
    },

    toggleMute: () => {
        const nextMuted = !get().muted;
        const { sounds } = get();
        Object.values(sounds).forEach((p) => {
            if (p) p.muted = nextMuted;
        });
        set({ muted: nextMuted });
    },

    setSfxVolume: (volume: number) => {
        const { sounds } = get();
        Object.entries(sounds).forEach(([name, p]) => {
            if (p && name !== 'fluffy-soundtrack') p.volume = volume;
        });
        set({ sfxVolume: volume });
    },

    setBgmVolume: (volume: number) => {
        const bgm = get().sounds['fluffy-soundtrack'];
        if (bgm) bgm.volume = volume;
        set({ bgmVolume: volume });
    },

    playSound: (name: SoundNames) => {
        const player = get().sounds[name];
        if (!player) return;
        player.loop = false;
        if (player.playing) {
            player.pause();
        }
        player.seekTo(0);
        player.volume = name === 'fluffy-soundtrack' ? get().bgmVolume : get().sfxVolume;
        player.muted = get().muted;
        player.play();
    },

    playBgm: (name: SoundNames) => {
        if (name !== 'fluffy-soundtrack') return; // restrict BGM to menu track only
        const player = get().sounds['fluffy-soundtrack'];
        if (player) {
            player.loop = true;
            player.volume = get().bgmVolume;
            player.muted = get().muted;
            player.play();
        }
    },

    stopBgm: () => {
        const bgm = get().sounds['fluffy-soundtrack'];
        if (bgm) {
            bgm.loop = false;
            bgm.pause();
            bgm.seekTo(0);
        }
    },

    pauseBgm: () => {
        const bgm = get().sounds['fluffy-soundtrack'];
        if (bgm) bgm.pause();
    },

    unloadSounds: () => {
        Object.values(get().sounds).forEach((p) => {
            if (p) p.remove();
        });
        set({ sounds: {}, ready: false });
    }
}));