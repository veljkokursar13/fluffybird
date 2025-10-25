import { Text, Pressable, StyleSheet, View } from 'react-native';

interface MenuButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  size?: 'default' | 'compact';
}

export default function MenuButton({ onPress, title = 'Menu', disabled = false, size = 'default' }: MenuButtonProps) {
  const isCompact = size === 'compact';
  return (
    <Pressable
      style={({ pressed }) => [
        MenuButtonStyles.pressableArea,
        disabled && { opacity: 0.7 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {({ pressed }) => (
        <View style={[MenuButtonStyles.wrapper, isCompact && MenuButtonStyles.wrapperCompact]}>
          <View
            style={[
              MenuButtonStyles.shadowLayer,
              pressed && MenuButtonStyles.shadowLayerPressed,
            ]}
          />
          <View
            style={[
              MenuButtonStyles.buttonFace,
              pressed && MenuButtonStyles.buttonFacePressed,
              isCompact && MenuButtonStyles.buttonFaceCompact,
            ]}
          >
            <View style={MenuButtonStyles.gloss} />
            <Text style={[MenuButtonStyles.primaryButtonText, isCompact && MenuButtonStyles.primaryButtonTextCompact]}>{title}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const MenuButtonStyles = StyleSheet.create({
  pressableArea: {
    alignSelf: 'center',
  },
  wrapper: {
    position: 'relative',
    width: 230,
  },
  wrapperCompact: {
    minWidth: 140,
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
    width: '100%',
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
  buttonFaceCompact: {
    paddingHorizontal: 18,
    paddingVertical: 10,
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
  primaryButtonTextCompact: {
    fontSize: 16,
  },
});