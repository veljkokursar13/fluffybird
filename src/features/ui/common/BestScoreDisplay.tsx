import { View, Text } from 'react-native';
import { hudStyles } from '../../../styles/styles';

interface BestScoreDisplayProps {
  bestScore: number;
  currentScore: number;
}

export default function BestScoreDisplay({ bestScore, currentScore }: BestScoreDisplayProps) {
  const isNewBest = currentScore > bestScore;
  
  return (
    <View>
      <Text style={hudStyles.scoreText}>Score: {currentScore}</Text>
      <Text style={[hudStyles.scoreText, isNewBest && { color: '#FFD700', fontWeight: '700' }]}>Best: {bestScore}</Text>
    </View>
  );
}
