import PlayButton from './PlayButton';

interface RestartButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
}

export default function RestartButton({ onPress, title = 'Restart', disabled = false }: RestartButtonProps) {
  return <PlayButton onPress={onPress} title={title} disabled={disabled} />;
}
