import 'react-native-reanimated'
import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'
import { Dimensions, StyleSheet, View, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import useFont from '../src/hooks/useFont'
import { useEffect, useState } from 'react'
import { preloadGameAssets } from '@/src/utils/assetPreloader'
// import mobileAds from 'react-native-google-mobile-ads' // TODO: Restore when ready for production

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default function RootLayout() {
  const fontsLoaded = useFont()
  const [assetsLoaded, setAssetsLoaded] = useState(false)

  // TODO: Initialize AdMob - Restore when ready for production
  // useEffect(() => {
  //   mobileAds()
  //     .initialize()
  //     .then(adapterStatuses => {
  //       console.log('AdMob initialized');
  //     });
  // }, []);
  
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
