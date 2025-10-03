//use sound hook
import { useEffect } from 'react'
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio'
import type { AudioSource } from 'expo-audio'

type UseSoundOptions = {
  autoplay?: boolean
  loop?: boolean
  volume?: number
  mute?: boolean
}

export default function useSound(source: AudioSource, options: UseSoundOptions = {}) {
  const { autoplay = true, loop = true, volume = 1, mute = false } = options
  const player = useAudioPlayer(source)

  useEffect(() => {
    let isActive = true
    ;(async () => {
      try {
        // Ensure audio plays even if device is in silent mode
        await setAudioModeAsync({ playsInSilentMode: true })
        if (!isActive) return

        player.volume = volume
        player.loop = !!loop
        player.muted = !!mute
        if (autoplay) {
          player.play()
        }
      } catch {}
    })()

    return () => {
      isActive = false
    }
  }, [player, autoplay, loop, volume, mute])

  return player
}