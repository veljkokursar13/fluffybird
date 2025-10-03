import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import PlayButton from '../buttons/PlayButton';
import RestartButton from '../buttons/RestartButton';
import { BlurView } from 'expo-blur';
import ScoreDisplay from '../common/ScoreDisplay';
import BestScoreDisplay from '../common/BestScoreDisplay';

export default function GameOverOverlay() {
  const score = useGameStore((state) => state.score);
  const bestScore = useGameStore((state) => state.bestScore);
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);

  const handleRestart = () => {
    resetGame();
    setGameState('playing');
  };

  const handleMenu = () => {
    resetGame();
    setGameState('menu');
  };

  return (
    <BlurView>
      <Text>Game Over</Text>
      <BestScoreDisplay bestScore={bestScore} currentScore={score} />
      <ScoreDisplay score={score} />
      <View style={GameOverOverlayStyles.buttonContainer}>
        <RestartButton onPress={handleRestart} title="Play Again" />
        <PlayButton onPress={handleMenu} title="Back to Menu" />
      </View> 
    </BlurView>
  );
}

const GameOverOverlayStyles = StyleSheet.create({ 
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});