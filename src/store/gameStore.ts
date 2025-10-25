import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../engine/config/settings';
import { router } from 'expo-router';
import { Bird, jumpBooster, resetCombo } from '../engine/entities/bird';
import { PipePair } from '../engine/entities/pipes';
import { AdaptiveDifficulty } from '../engine/config/difficulty';


export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'reset';
export const gameStates: GameState[] = ['menu', 'playing', 'paused', 'gameOver', 'reset'];

interface GameStore {
  // Game state
  gameState: GameState;
  score: number;
  bestScore: number;
  newBestAchieved: boolean;
  // Input state
  jumpTick: number; // Increments on each jump to trigger animations
  // Sound state
  muted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  
  // Game entities
  bird: Bird;
  pipes: PipePair[];
  
  // Adaptive difficulty
  adaptiveDifficulty: AdaptiveDifficulty;
  
  // Game actions
  setGameState: (state: GameState) => void;
  setGameOverState: (state: GameState) => void;
  gameOver: () => void;
  resetGame: () => void;
  clearGameCache: () => void; // Clears game state but preserves bestScore
  backToMenu: () => void;
  updateBird: (bird: Partial<Bird>) => void;
  jump: () => void;
  acknowledgeNewBest: () => void;
}

const initialBird: Bird = {
  pos: { x: CONFIG.bird.startX, y: CONFIG.bird.startY },
  vel: { x: 0, y: 0 },
  r: CONFIG.bird.radius,
  size: CONFIG.bird.size,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      gameState: 'menu',
      score: 0,
      bestScore: 0,
      newBestAchieved: false,
      jumpTick: 0,
      muted: false,
      bird: initialBird,
      pipes: [],
      adaptiveDifficulty: new AdaptiveDifficulty('easy'),

      // Actions
      setGameState: (gameState) => set({ gameState }),
      setGameOverState: (state) => {
        set({ gameState: state });
        if (state === 'gameOver') {
          const currentScore = get().score;
          const prevBest = get().bestScore;
          const isNewBest = currentScore > prevBest;
          get().adaptiveDifficulty.onDeath();
          set({ bestScore: Math.max(currentScore, prevBest), newBestAchieved: isNewBest });
        }
      },
      setMuted: (muted) => set({ muted }),
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
      
      gameOver: () => {
        set({ gameState: 'gameOver' });
        const currentScore = get().score;
        const prevBest = get().bestScore;
        const isNewBest = currentScore > prevBest;
        get().adaptiveDifficulty.onDeath();
        set({ bestScore: Math.max(currentScore, prevBest), newBestAchieved: isNewBest });
      },
      
      resetGame: () => {
        resetCombo();
        set({
          gameState: 'menu',
          score: 0,
          bird: { ...initialBird },
          pipes: [],
          jumpTick: 0,
          newBestAchieved: false,
          adaptiveDifficulty: new AdaptiveDifficulty('easy'),
        });
      },
      
      clearGameCache: () => {
        resetCombo();
        set({
          bird: { ...initialBird },
          pipes: [],
          jumpTick: 0,
        });
      },
      
      backToMenu: () => {
        set({ gameState: 'menu' });
        router.replace('/');
      },
      
      updateBird: (birdUpdate: Partial<Bird>) => set((state) => {
        if (!state.bird || !birdUpdate) return {};
        return { bird: { ...state.bird, ...birdUpdate } };
      }),
      
      jump: () => set((state) => {
        if (!state.bird?.vel) return {};
        return {
          bird: {
            ...state.bird,
            vel: { ...state.bird.vel, y: jumpBooster(CONFIG.physics.jumpVelocity) },
          },
          jumpTick: state.jumpTick + 1,
        };
      }),
      acknowledgeNewBest: () => set({ newBestAchieved: false }),
    }),
    {
      name: 'game-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bestScore: state.bestScore,
      }),
    }
  )
);