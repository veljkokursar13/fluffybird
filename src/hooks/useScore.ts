//score hook
import { useGameStore } from '../store/gameStore'
import * as Haptics from 'expo-haptics'
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
  const newBest = useGameStore((s) => s.newBestAchieved);
  const acknowledgeNewBest = useGameStore((s) => s.acknowledgeNewBest);
  const triggerConfetti = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };
  return { bestScore, newBest, acknowledgeNewBest, triggerConfetti };
}
