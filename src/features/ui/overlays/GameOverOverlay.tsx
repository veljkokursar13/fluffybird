import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import PlayButton from '../buttons/PlayButton';
import RestartButton from '../buttons/RestartButton';
import { BlurView } from 'expo-blur';
import BestScoreDisplay from '../common/BestScoreDisplay';
import { overlayStyles } from '../../../styles/styles';
import SoundSettingButton from '../buttons/SoundSettingButton';

export default function GameOverOverlay() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const bestScore = useGameStore((state) => state.bestScore);
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);
  const backToMenu = useGameStore((state) => state.backToMenu);

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
      <SoundSettingButton />
      <View style={overlayStyles.modal}>
        <Text style={[overlayStyles.modalTitle, GameOverLocalStyles.title]}>Game Over</Text>
        <View style={overlayStyles.modalContent}>
          <BestScoreDisplay bestScore={bestScore} currentScore={score} />
        </View>
        <View style={[overlayStyles.verticalButtonContainer, GameOverLocalStyles.buttonStack]}>
          <View style={GameOverLocalStyles.buttonItem}>
            <RestartButton onPress={handleRestart} title="Play Again" />
          </View>
          <View style={GameOverLocalStyles.buttonItem}>
            <PlayButton onPress={handleMenu} title="Back to Menu" />
          </View>
        </View>
      </View>
    </View>
  );
}

const GameOverLocalStyles = StyleSheet.create({
  title: {
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  buttonStack: {
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonItem: {
    width: '100%',
    alignItems: 'center',
  },
});