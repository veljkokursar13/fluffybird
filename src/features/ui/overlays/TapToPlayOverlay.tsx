// Tap to play overlay. Shows on game screen when entering from menu.
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '@/src/store/gameStore';

export default function TapToPlayOverlay() {
  const gameState = useGameStore((s) => s.gameState);
  if (gameState !== 'menu') return null;
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.centerBox}>
        <Text style={styles.title}>Tap to Play</Text>
        <Text style={styles.subtitle}>Tap anywhere to start</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'fff-forward.regular',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    fontFamily: 'fff-forward.regular',
  },
});