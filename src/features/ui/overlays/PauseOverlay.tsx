import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import PlayButton from '../buttons/PlayButton';
import MenuButton from '../buttons/MenuButton';
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
        
        <View style={PauseOverlayLocalStyles.buttonsResume}>
          <PlayButton onPress={handleResume} title="Resume" />
        </View>
        <View style={PauseOverlayLocalStyles.buttonsRestart}>
          <RestartButton onPress={handleRestart} title="Restart" />
        </View>
        <View style={PauseOverlayLocalStyles.buttonsMenu}>
          <MenuButton onPress={handleMenu} title="Back to Menu" />
        </View>
      </View>
    </View>
  );
}

const PauseOverlayLocalStyles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 72,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'fff-forward.regular',
    marginTop: 0,
    marginBottom: 100,
  },
  scoreCenter: {
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonsResume: {
    marginBottom: 20,
  },
  buttonsRestart: {
    marginBottom: 30,
  },
  buttonsMenu: {
    marginTop: 30,
    transform: [{ scale: 0.65 }],
  },
});