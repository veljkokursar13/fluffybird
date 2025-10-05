//use sound hook
import { useEffect, useState } from 'react'
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio'
import type { AudioSource } from 'expo-audio'

type UseSoundOptions = {
  autoplay?: boolean
  loop?: boolean
  volume?: number
  mute?: boolean
}

// Global flag to prevent concurrent audio initialization
let audioModeInitialized = false
let audioModePromise: Promise<void> | null = null

export default function useSound(source: AudioSource, options: UseSoundOptions = {}) {
  const { autoplay = true, loop = true, volume = 1, mute = false } = options
  const player = useAudioPlayer(source)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let isActive = true
    
    const initializeAudio = async () => {
      try {
        // Initialize audio mode only once globally
        if (!audioModeInitialized) {
          if (!audioModePromise) {
            audioModePromise = setAudioModeAsync({ playsInSilentMode: true })
          }
          await audioModePromise
          audioModeInitialized = true
        }
        
        if (!isActive) return

        // Add small delay to prevent resource conflicts
        await new Promise(resolve => setTimeout(resolve, 50))
        
        if (!isActive) return

        player.volume = volume
        player.loop = !!loop
        player.muted = !!mute
        
        if (autoplay) {
          await player.play()
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.warn('Audio initialization failed:', error)
        setIsInitialized(false)
      }
    }

    initializeAudio()

    return () => {
      isActive = false
    }
  }, [player, autoplay, loop, volume, mute])

  return player
}