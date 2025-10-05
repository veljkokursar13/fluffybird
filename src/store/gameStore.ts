import { create } from 'zustand';
import { CONFIG } from '../engine/settings';
import type { Bird, Pipe } from '../engine/types';
import { router } from 'expo-router';


export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

interface GameStore {
  // Game state
  gameState: GameState;
  score: number;
  bestScore: number;
  // Input animation ticks
  flapTick: number;
  // Sound state
  muted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  
  // Game entities
  bird: Bird;
  pipes: Pipe[];
  
  // Game actions
  setGameState: (state: GameState) => void;
  incrementScore: () => void;
  resetGame: () => void;
  backToMenu: () => void;
  updateBird: (bird: Partial<Bird>) => void;
  updatePipes: (pipes: Pipe[]) => void;
  jump: () => void;
}

const initialBird: Bird = {
  pos: { x: CONFIG.bird.startX, y: CONFIG.bird.startY },
  vel: { x: 0, y: 0 },
  r: CONFIG.bird.radius,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: 'menu',
  score: 0,
  bestScore: 0,
  muted: false,
  bird: initialBird,
  pipes: [],
  flapTick: 0,
  
  // Actions
  setGameState: (gameState) => set({ gameState }),
  setMuted: (muted) => set({ muted }),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
  
  incrementScore: () => set((state) => {
    const newScore = state.score;
    return {
      score: newScore,
      bestScore: Math.max(newScore, state.bestScore),
    };
  }),
  
  resetGame: () => set({
    gameState: 'menu',
    score: 0,
    bird: { ...initialBird },
    pipes: [],
  }),
  
  backToMenu: () => {
    set({ gameState: 'menu' });
    router.replace('/');
  },
  
  updateBird: (birdUpdate) => set((state) => ({
    bird: { ...state.bird, ...birdUpdate },
  })),
  
  updatePipes: (pipes) => set({ pipes }),
  
  jump: () => set((state) => ({
    bird: {
      ...state.bird,
      vel: { ...state.bird.vel, y: CONFIG.physics.jumpVelocity },
    },
    flapTick: state.flapTick + 1,
  })),
}));