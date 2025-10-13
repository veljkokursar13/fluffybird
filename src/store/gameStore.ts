import { create } from 'zustand';
import { CONFIG } from '../engine/config/settings';
import { router } from 'expo-router';
import { Bird, jumpBooster } from '../engine/entities/bird';
import { Pipes } from '../engine/entities/pipes';


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
  pipes: Pipes[];
  
  
  // Game actions
  setGameState: (state: GameState) => void;
  setGameOverState: (state: GameState) => void;
  gameOver: () => void;
  incrementScore: () => void;
  resetGame: () => void;
  backToMenu: () => void;
  updateBird: (bird: Partial<Bird>) => void;
  jump: () => void;
}

const initialBird: Bird = {
  pos: { x: CONFIG.bird.startX, y: CONFIG.bird.startY },
  vel: { x: 0, y: 0 },
  r: CONFIG.bird.radius,
  size: CONFIG.bird.size,
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
  setGameOverState: (state) => {
    set({ gameState: state });
    if (state === 'gameOver') {
      const currentScore = get().score;
      set((s) => ({ bestScore: Math.max(currentScore, s.bestScore) }));
    }
  },
  setMuted: (muted) => set({ muted }),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
  incrementScore: () => set((state) => {
    const newScore = state.score + 1;
    return {
      score: newScore,
      bestScore: Math.max(newScore, state.bestScore),
    };
  }),
  
  gameOver: () => {
    set({ gameState: 'gameOver' });
    const currentScore = get().score;
    set((state) => ({
      bestScore: Math.max(currentScore, state.bestScore),
    }));
  },
  
  resetGame: () => set({
    gameState: 'menu',
    score: 0,
    bird: { ...initialBird },
    flapTick: 0,
  }),
  
  backToMenu: () => {
    set({ gameState: 'menu' });
    router.replace('/');
  },
  
  updateBird: (birdUpdate: Partial<Bird>) => set((state) => ({
    bird: { ...state.bird, ...birdUpdate },
  })),
  

  
  jump: () => set((state) => ({
    bird: {
      ...state.bird,
      vel: { ...state.bird.vel, y: jumpBooster(CONFIG.physics.jumpVelocity) },
    },
    flapTick: state.flapTick + 1,
  })),
}));