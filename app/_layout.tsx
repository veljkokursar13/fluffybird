import 'react-native-reanimated'
import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'
import { Dimensions, StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import useFont from '../src/hooks/useFont'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default function RootLayout() {
  const fontsLoaded = useFont()
  
  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <View style={{ flex: 1 }}>
    <SafeAreaProvider>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: screenStyles.screen,
          animation: 'none',
        }}
      />
    </SafeAreaProvider>
    </View>
  )
}

const screenStyles = StyleSheet.create({
  screen: {
    width: screenWidth,
    height: screenHeight,
    flex: 1,
  },
})
