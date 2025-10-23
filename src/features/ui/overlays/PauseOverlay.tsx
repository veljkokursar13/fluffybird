import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import PlayButton from '../buttons/PlayButton';
import RestartButton from '../buttons/RestartButton';
import { BlurView } from 'expo-blur';
import BestScoreDisplay from '../common/BestScoreDisplay';
import { overlayStyles } from '../../../styles/styles';
import { resetSpawnTimer } from '../../../engine/systems/spawning';


export default function PauseOverlay() {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);
  const backToMenu = useGameStore((state) => state.backToMenu);
  const score = useGameStore((state) => state.score);
  const bestScore = useGameStore((state) => state.bestScore);

  if (gameState !== 'paused') return null;

  const handleResume = () => {
    setGameState('playing');
  };

  const handleRestart = () => {
    resetSpawnTimer();
    resetGame();
    setGameState('playing');
  };

  const handleMenu = () => {
    resetSpawnTimer();
    resetGame();
    backToMenu();
  };

  return (
    <View style={overlayStyles.overlay}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
     
      <View style={PauseOverlayLocalStyles.layoutContainer}>
        <Text style={PauseOverlayLocalStyles.title}>Paused</Text>
        
        <View style={PauseOverlayLocalStyles.scoreCenter}>
          <BestScoreDisplay bestScore={bestScore} currentScore={score} />
        </View>
        
        <View style={PauseOverlayLocalStyles.buttonsBottom}>
          <PlayButton onPress={handleResume} title="Resume" />
          <RestartButton onPress={handleRestart} title="Restart" />
          <PlayButton onPress={handleMenu} title="Back to Menu" />
        </View>
      </View>
    </View>
  );
}

const PauseOverlayLocalStyles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 80,
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