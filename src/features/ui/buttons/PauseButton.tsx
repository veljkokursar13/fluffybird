import { Pressable, Text, StyleSheet } from 'react-native';

interface PauseButtonProps {
  onPress: () => void;
  isPaused?: boolean;
}

export default function PauseButton({ onPress, isPaused = false }: PauseButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        PauseButtonStyles.baseButton,
        PauseButtonStyles.smallButton,
        pressed && PauseButtonStyles.smallButtonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={PauseButtonStyles.smallButtonText}>
        {isPaused ? '▶' : '⏸'}
      </Text>
    </Pressable>
  );
}

const PauseButtonStyles = StyleSheet.create({
  baseButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  smallButton: {
    padding: 10,
    borderRadius: 5,
  },
  smallButtonPressed: {
    backgroundColor: 'gray',
  },
  smallButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
