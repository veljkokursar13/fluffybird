//score display
import useScore from '../../../hooks/useScore';
import { View, Text } from 'react-native';
import { hudStyles } from '../../../styles/styles';

interface ScoreDisplayProps {
  score?: number;
  style?: any;
}

export default function ScoreDisplay({ score, style }: ScoreDisplayProps) {
  const { score: currentScore } = useScore();
  return (
    <View style={[hudStyles.scoreContainer, style]}>
      <Text style={hudStyles.scoreText}>{score ?? currentScore}</Text>
    </View>
  );
}

