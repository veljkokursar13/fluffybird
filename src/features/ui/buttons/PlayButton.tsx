import { Text, Pressable, StyleSheet, View } from 'react-native';

interface PlayButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
}

export default function PlayButton({ onPress, title = 'Play', disabled = false }: PlayButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        PlayButtonStyles.pressableArea,
        disabled && { opacity: 0.7 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {({ pressed }) => (
        <View style={PlayButtonStyles.wrapper}>
          <View
            style={[
              PlayButtonStyles.shadowLayer,
              pressed && PlayButtonStyles.shadowLayerPressed,
            ]}
          />
          <View
            style={[
              PlayButtonStyles.buttonFace,
              pressed && PlayButtonStyles.buttonFacePressed,
            ]}
          >
            <View style={PlayButtonStyles.gloss} />
            <Text style={PlayButtonStyles.primaryButtonText}>{title}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const PlayButtonStyles = StyleSheet.create({
  pressableArea: {
    alignSelf: 'center',
  },
  wrapper: {
    position: 'relative',
    minWidth: 160,
  },
  shadowLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#6b4a00',
    borderRadius: 8,
    transform: [{ translateX: 6 }, { translateY: 6 }],
  },
  shadowLayerPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  buttonFace: {
    backgroundColor: '#f7d51d',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderTopColor: '#fff4a8',
    borderLeftColor: '#fff4a8',
    borderRightColor: '#b58c0b',
    borderBottomColor: '#b58c0b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonFacePressed: {
    backgroundColor: '#eecf17',
    borderRightColor: '#a07b09',
    borderBottomColor: '#a07b09',
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOpacity: 0.1,
    elevation: 2,
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  primaryButtonText: {
    fontSize: 20,
    color: '#0b1020',
    textAlign: 'center',
    fontFamily: 'fff-forward.regular',
  },
});