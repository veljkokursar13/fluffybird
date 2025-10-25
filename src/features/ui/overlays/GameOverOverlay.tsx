import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useGameStore } from '../../../store/gameStore';
import PlayButton from '../buttons/PlayButton';
import RestartButton from '../buttons/RestartButton';
import { BlurView } from 'expo-blur';
import BestScoreDisplay from '../common/BestScoreDisplay';
import { overlayStyles } from '../../../styles/styles';
import { useBestScore } from '@/src/hooks/useScore';
export default function GameOverOverlay() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const bestScore = useGameStore((state) => state.bestScore);
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);
  const backToMenu = useGameStore((state) => state.backToMenu);
  const { newBest, acknowledgeNewBest, triggerConfetti } = useBestScore();

  useEffect(() => {
    if (newBest) {
      triggerConfetti();
      acknowledgeNewBest();
    }
  }, [newBest, acknowledgeNewBest]);

  const handleRestart = () => {
    resetGame();
    setGameState('playing');
  };

  const handleMenu = () => {
    resetGame();
    backToMenu();
  };

  if (gameState !== 'gameOver') return null;

  return (
    <View style={overlayStyles.overlay}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={GameOverLocalStyles.layoutContainer}>
        <Text style={GameOverLocalStyles.title}>Game Over</Text>
        
        <View style={GameOverLocalStyles.scoreCenter}>
          <BestScoreDisplay bestScore={bestScore} currentScore={score} />
        </View>
        
        <View style={GameOverLocalStyles.buttonsBottom}>
          <RestartButton onPress={handleRestart} title="Play Again" />
          <PlayButton onPress={handleMenu} title="Back to Menu" />
        </View>
      </View>
    </View>
  );
}

const GameOverLocalStyles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'fff-forward.regular',
    marginTop: 0,
    marginBottom: 12,
  },
  scoreCenter: {
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsBottom: {
    marginTop: 16,
    gap: 14,
    alignItems: 'center',
    transform: [{ scale: 0.85 }],
  },
});