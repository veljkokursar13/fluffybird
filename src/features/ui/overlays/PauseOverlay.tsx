import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import PlayButton from '../buttons/PlayButton';
import RestartButton from '../buttons/RestartButton';
import { BlurView } from 'expo-blur';
import BestScoreDisplay from '../common/BestScoreDisplay';

export default function PauseOverlay() {
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);
  const backToMenu = useGameStore((state) => state.backToMenu);
  const score = useGameStore((state) => state.score);
  const bestScore = useGameStore((state) => state.bestScore);
  const handleResume = () => {
    setGameState('playing');
  };

  const handleRestart = () => {
    resetGame();
    setGameState('playing');
  };

  const handleMenu = () => {
    resetGame();
    backToMenu();
  };

  return (
    <View style={PauseOverlayStyles.container}>
      <BlurView intensity={30} tint="light" style={PauseOverlayStyles.blur} />
      <View style={PauseOverlayStyles.positionTop}>
      <BestScoreDisplay bestScore={bestScore} currentScore={score}/>
      </View>
      <View style={PauseOverlayStyles.pauseContent}>
        <View style={PauseOverlayStyles.buttonContainer}>
          <PlayButton onPress={handleResume} title="Resume" />
          <RestartButton onPress={handleRestart} title="Restart" />
        </View>
        <View style={PauseOverlayStyles.singleButtonContainer}>
          <PlayButton onPress={handleMenu} title="Back to Menu" />
        </View>
      </View>
    </View>
  );
}

const PauseOverlayStyles = StyleSheet.create({
  positionTop: {
    position: 'absolute',
    top: 70,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  blur: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  pauseContent: {
    padding: 20,
    borderRadius: 10,
  },
 
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  singleButtonContainer: {
    width: '100%',
    alignItems: 'center',
    //position it in the center beneath other two buttons
   
  },
});