//score hook
import { useGameStore } from '../store/gameStore'
//score starts from 0
const initialScore = 0;
const initialBestScore = 0;

export default function useScore() {
  const score = useGameStore((state) => state.score) || initialScore;
  const resetGame = useGameStore((state) => state.resetGame);
  return { score, resetGame };
}

export function useBestScore() {
  const bestScore = useGameStore((state) => state.bestScore) || initialBestScore;
  return { bestScore };
}
