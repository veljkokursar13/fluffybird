import React from 'react'
import { StyleSheet, View, Text, ImageBackground, Dimensions, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import PlayButton from '../src/features/ui/buttons/PlayButton'
import useFont from '../src/hooks/useFont'
import { gameStyles } from '../src/styles/styles'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay, Easing } from 'react-native-reanimated'
import BirdImageForMenu from '@assets/images/bird-for-menu.png'
import cityBackground from '@assets/images/city-background.png'
import { Volume2, VolumeX } from 'lucide-react-native'
import { useSoundStore } from '@src/sound/soundStore'
import { useState, useEffect } from 'react'
import { Asset } from 'expo-asset'

//preload images

export function usePreloadImages(images: number[]) {
  const [isPreloaded, setIsPreloaded] = useState(false)

  useEffect(() => {
    async function load(){
      try {
        const cacheAssets = images.map(img => Asset.fromModule(img).downloadAsync())
        await Promise.all(cacheAssets)
        setIsPreloaded(true)
      } catch (error) {
        console.error('Error preloading images:', error)
      }finally{
        setIsPreloaded(true)
    }
    }
    load()
  }, [])
  return isPreloaded
}

// Full-screen SafeArea; background handled via ImageBackground
function BirdImageAnimation() {
  const floatY = useSharedValue(0)

  // gentle up-down loop
  React.useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    )
  }, [floatY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }))

  return (
    <Animated.Image source={BirdImageForMenu} style={[indexStyles.birdBehind, animatedStyle]} />
  )
}

function AddParticles() {
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window')

  const particles = React.useMemo(() => {
    const count = 14
    return Array.from({ length: count }).map((_, i) => {
      const size = 3 + Math.round(Math.random() * 5)
      const left = Math.round(Math.random() * (screenWidth - size))
      const duration = 4500 + Math.round(Math.random() * 3500)
      const delay = Math.round(Math.random() * 2000)
      return { id: i, size, left, duration, delay }
    })
  }, [screenHeight, screenWidth])

  return (
    <View pointerEvents="none" style={indexStyles.particlesLayer}>
      {particles.map((p) => (
        <Particle key={p.id} screenHeight={screenHeight} {...p} />
      ))}
    </View>
  )
}

function Particle({ size, left, duration, delay, screenHeight }: { size: number; left: number; duration: number; delay: number; screenHeight: number }) {
  const y = useSharedValue(screenHeight + Math.random() * 120)

  React.useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(-size, { duration, easing: Easing.linear })),
        withTiming(screenHeight + size, { duration: 0 })
      ),
      -1,
      false
    )
  }, [y, delay, duration, screenHeight, size])

  const style = useAnimatedStyle(() => ({
    top: y.value,
    left,
    width: size,
    height: size,
    borderRadius: size / 2,
    opacity: 0.6,
  }))

  return <Animated.View style={[indexStyles.particle, style]} />
}
export default function MenuScreen() {
  const fontsLoaded = useFont();
  const toggleMute = useSoundStore(state => state.toggleMute);
  const muted = useSoundStore(state => state.muted);
  const init = useSoundStore(state => state.init);
  const playBgm = useSoundStore(state => state.playBgm);
  const stopBgm = useSoundStore(state => state.stopBgm);
  const handleStartGame = async () => {
    try {

    } catch {}
    stopBgm();
    router.push('/game')
  }
  
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      await init();
      if (mounted) playBgm('fluffy-soundtrack');
    })();
    return () => {
      mounted = false;
      stopBgm();
    };
  }, [init, playBgm, stopBgm]);
  
  if (!fontsLoaded) {
    return null; // or a loading screen
  }

  return (
     
  <ImageBackground source={cityBackground} style={indexStyles.background} imageStyle={indexStyles.backgroundImage}>
        <AddParticles />
    
        <View style={indexStyles.hero}>
          {/* mute button */}
          <TouchableOpacity onPress={toggleMute} style={indexStyles.muteButton} accessibilityLabel="Toggle mute">
            {muted ? <VolumeX size={30 } color="#ffffff" /> : <Volume2 size={30} color="#ffffff" />}
          </TouchableOpacity>
          <BirdImageAnimation />
          <View style={indexStyles.titleBlock}>
            <Text style={indexStyles.titleText}>Fluffy Bird</Text>
            <Text style={indexStyles.subtitleText}>How hard can you tap?</Text>
          </View>
        </View>
        {/* Button in lower third */} 
        <View style={gameStyles.menuButtonContainer}>
          <PlayButton onPress={handleStartGame} title="Start Game" />
        </View>
      </ImageBackground>
  )
}

const indexStyles = StyleSheet.create({
 
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  particlesLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  birdBehind: {
    width: 220,
    height: 220,
    position: 'absolute',
    zIndex: 0,
    alignSelf: 'center',
    top: '20%',
  },
  titleBlock: {
    alignItems: 'center',
    zIndex: 1,
  },
  titleText: {
    fontSize: 72,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'IrishGrover-Regular',
  },
  subtitleText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'PressStart2P-Regular',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  muteButton: {
    paddingTop: 30,
    position: 'absolute',
    right: 16,
    top: 16,
  },
 
})