import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useInput() {
  const gameState = useGameStore((state) => state.gameState);
  const jump = useGameStore((state) => state.jump);
  const setGameState = useGameStore((state) => state.setGameState);

  const handleTap = () => {
    switch (gameState) {
      case 'menu':
        setGameState('playing');
        break;
      case 'playing':
        jump();
        break;
      case 'gameOver':
        // Game over actions handled by overlay buttons
        break;
      case 'paused':
        // Pause actions handled by overlay buttons
        break;
    }
  };

  return {
    handleTap,
  };
}
