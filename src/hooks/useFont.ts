import { useFonts } from 'expo-font';

export default function useFont() {
  const [fontsLoaded] = useFonts({
    'fff-forward.regular': require('../../assets/fonts/fff-forward.regular.ttf'),
    'IrishGrover-Regular': require('../../assets/fonts/IrishGrover-Regular.ttf'),
    'PressStart2P-Regular': require('../../assets/fonts/PressStart2P-Regular.ttf'),
  });
  return fontsLoaded;
}
