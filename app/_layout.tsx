import 'react-native-reanimated'
import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'
import { Dimensions, StyleSheet, View, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import useFont from '../src/hooks/useFont'
import { useEffect, useState } from 'react'
import { preloadGameAssets } from '@/src/utils/assetPreloader'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default function RootLayout() {
  const fontsLoaded = useFont()
  const [assetsLoaded, setAssetsLoaded] = useState(false)

  // Preload all game assets on app start
  useEffect(() => {
    preloadGameAssets().then(() => setAssetsLoaded(true))
  }, [])
  
  if (!fontsLoaded || !assetsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#70C5CE' }}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
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
