import { View, Text, StyleSheet } from 'react-native';

interface BestScoreDisplayProps {
  bestScore: number;
  currentScore: number;
}

export default function BestScoreDisplay({ bestScore, currentScore }: BestScoreDisplayProps) {
  const isNewBest = currentScore > bestScore;
  
  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>Score: {currentScore}</Text>
      <Text style={[styles.scoreText, isNewBest && { color: '#FFD700' }]}>Best: {bestScore}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PressStart2P-Regular',
    textAlign: 'center',
  },
});
