import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

type TickerFn = (dt: number, now: number) => void;

/**
 * Custom hook for game loop timing. Runs only when gameState === 'playing'.
 * Uses ref pattern to avoid restarting the loop on callback changes.
 * 
 * @param callback - Function called each frame with (deltaTime, timestamp)
 */
export function useTicker(callback: TickerFn) {
  const gameState = useGameStore((s) => s.gameState);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const callbackRef = useRef<TickerFn>(callback);

  // Keep callback ref updated without restarting the effect
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
      return;
    }

    const loop = (now: number) => {
      const last = lastRef.current ?? now;
      const raw = (now - last) / 1000;
      lastRef.current = now;
      // Clamp dt to reasonable bounds: min 1/120s (120fps), max 0.05s (20fps)
      const dt = Math.max(1 / 120, Math.min(raw || 1 / 60, 0.05));
      callbackRef.current(dt, now);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [gameState]);
}


