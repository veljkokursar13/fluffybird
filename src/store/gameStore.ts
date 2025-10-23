import { create } from 'zustand';
import { CONFIG } from '../engine/config/settings';
import { router } from 'expo-router';
import { Bird, jumpBooster, resetCombo } from '../engine/entities/bird';
import { PipePair } from '../engine/entities/pipes';


export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'reset';
export const gameStates: GameState[] = ['menu', 'playing', 'paused', 'gameOver', 'reset'];

interface GameStore {
  // Game state
  gameState: GameState;
  score: number;
  bestScore: number;
  // Input state
  jumpTick: number; // Increments on each jump to trigger animations
  // Sound state
  muted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  
  // Game entities
  bird: Bird;
  pipes: PipePair[];
  
  
  // Game actions
  setGameState: (state: GameState) => void;
  setGameOverState: (state: GameState) => void;
  gameOver: () => void;
  resetGame: () => void;
  clearGameCache: () => void; // Clears game state but preserves bestScore
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
  jumpTick: 0,
  muted: false,
  bird: initialBird,
  pipes: [],

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
  
  gameOver: () => {
    set({ gameState: 'gameOver' });
    const currentScore = get().score;
    set((state) => ({
      bestScore: Math.max(currentScore, state.bestScore),
    }));
  },
  
  resetGame: () => {
    resetCombo(); // Reset jump combo counter
    set({
      gameState: 'menu',
      score: 0,
      bird: { ...initialBird },
      pipes: [],
      jumpTick: 0,
    });
  },
  
  // Clear all game cache (bird, pipes, score, jumpTick) but preserve bestScore
  clearGameCache: () => {
    resetCombo(); // Reset jump combo counter
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
    // Guard: prevent crashes if bird or update is invalid
    if (!state.bird || !birdUpdate) return {};
    return { bird: { ...state.bird, ...birdUpdate } };
  }),
  

  
  jump: () => set((state) => {
    // Guard: prevent crashes if bird is invalid
    if (!state.bird?.vel) return {};
    return {
      bird: {
        ...state.bird,
        vel: { ...state.bird.vel, y: jumpBooster(CONFIG.physics.jumpVelocity) },
      },
      jumpTick: state.jumpTick + 1,
    };
  }),
}));