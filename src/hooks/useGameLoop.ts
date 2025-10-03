import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameLoop() {
  const gameState = useGameStore((state) => state.gameState);
  const incrementScore = useGameStore((state) => state.incrementScore);
  
  const scoreTimerRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (gameState !== 'playing') {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 1/60;
      lastTimeRef.current = currentTime;

      // Simple scoring for testing - increment every 2s
      scoreTimerRef.current += deltaTime;
      if (scoreTimerRef.current >= 2) {
        incrementScore();
        scoreTimerRef.current = 0;
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, incrementScore]);

  return {
    isRunning: gameState === 'playing',
  };
}
