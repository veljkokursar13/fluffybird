import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

type TickerFn = (dt: number, now: number) => void;

export function useTicker(callback: TickerFn) {
  const gameState = useGameStore((s) => s.gameState);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

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
      const dt = Math.max(1 / 120, Math.min(raw || 1 / 60, 0.05));
      callback(dt, now);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [gameState, callback]);
}


