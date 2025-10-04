
import { Pressable, ViewStyle, StyleSheet } from 'react-native';
import { Volume2, VolumeOff } from 'lucide-react-native';
import { useSoundControl } from '../../../hooks/useSoundControl';

type SoundSettingButtonProps = {
  style?: ViewStyle;
  size?: number;
  color?: string;
};

function SoundSettingButton({ style, size = 24, color = '#ffffff' }: SoundSettingButtonProps) {
  const { muted, toggleMuted, accessibilityLabel } = useSoundControl();

  return (
    <Pressable
      onPress={toggleMuted}
      accessibilityLabel={accessibilityLabel}
      style={[SoundSettingButtonStyles.button]}
      hitSlop={8}
    >
      {muted ? <VolumeOff size={size} color={color} /> : <Volume2 size={size} color={color} />}
    </Pressable>
  );
}

export default SoundSettingButton;
export { SoundSettingButton };

const SoundSettingButtonStyles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 24,
    right: 16,
    padding: 14,
  
 
  },
});