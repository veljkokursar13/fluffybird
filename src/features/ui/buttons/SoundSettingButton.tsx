import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { Volume2, VolumeOff } from 'lucide-react-native';
import { useSoundSetting } from '../../../hooks/useSoundSetting';

type SoundSettingButtonProps = {
  style?: ViewStyle;
  size?: number;
  color?: string;
};

function SoundSettingButton({ style, size = 24, color = '#ffffff' }: SoundSettingButtonProps) {
  const [muted, toggleMuted] = useSoundSetting();

  return (
    <Pressable
      onPress={toggleMuted}
      accessibilityLabel="Toggle sound"
      style={[{ position: 'absolute', top: 16, right: 16, padding: 8 }, style]}
      hitSlop={8}
    >
      {muted ? <VolumeOff size={size} color={color} /> : <Volume2 size={size} color={color} />}
    </Pressable>
  );
}

export default SoundSettingButton;
export { SoundSettingButton };

