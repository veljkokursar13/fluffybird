import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable } from 'react-native';
import { gameStyles, hudStyles } from '../../styles/styles';
import SkiaRenderer from './SkiaRenderer';
import { useGameStore } from '../../store/gameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import useSound from '../../hooks/useSound';
import { useSoundSetting } from '../../hooks/useSoundSetting';
import gamePlaySound from '@assets/audio/gameplaysound.mp3'; 
import { Pause, Volume2, VolumeOff, VolumeX } from 'lucide-react-native';
// UI Overlays
import GameOverOverlay from '../ui/overlays/GameOverOverlay';
import PauseOverlay from '../ui/overlays/PauseOverlay';
import ScoreDisplay from '../ui/common/ScoreDisplay';

export default function GameContainer() {
  const gameState = useGameStore((state) => state.gameState);
  const jump = useGameStore((state) => state.jump);
  const setGameState = useGameStore((state) => state.setGameState);
  const [muted, toggleMuted] = useSoundSetting();
  const music = useSound(gamePlaySound, { autoplay: true, loop: true, volume: 0.6, mute: muted });
  // Initialize game loop - TEMPORARILY DISABLED FOR TESTING
  // useGameLoop();


const toggleMusic = (handleMute: boolean = false) => {
  if (!music) return;
  if (handleMute) {
    music.muted = false;
  } else {
    music.muted = true;
  }
};
  // Ensure HUD/icons render by starting gameplay from menu
  useEffect(() => {
    if (gameState === 'menu') {
      setGameState('playing');
    }
  }, [gameState, setGameState]);

  // Sync music with game state (mute handled via useSound deps)
  useEffect(() => {
    if (!music) return;
    (async () => {
      try {
        if (gameState === 'playing') {
          music?.play?.();
        } else if (gameState === 'paused') {
          music?.pause?.();
        } else if (gameState === 'gameOver') {
          music?.pause?.();
          await music?.seekTo?.(0);
        }
      } catch {}
    })();
  }, [gameState, music]);

  const handleTap = () => {
    if (gameState === 'playing') {
      jump();
    } else if (gameState === 'gameOver') {
      // Restart handled by GameOverOverlay buttons
    }
  };
  const handleToggleMute = () => {
    toggleMuted();
  };

  const handlePause = () => {
    setGameState('paused');
  };
  return (
    <View style={gameStyles.gameArea}>
      <Pressable onPress={handleTap} style={{ flex: 1 }}>
        {/* Skia Renderer with background shader */}
        <SkiaRenderer />

        {/* HUD while playing */}
        {gameState === 'playing' && (
          <View style={hudStyles.hud}>
            <ScoreDisplay />
            <View style={gameStyles.iconRow}>
              <TouchableOpacity onPress={handleToggleMute} accessibilityLabel="Toggle sound">
                {muted ? (
                  <VolumeOff size={24} color="#ffffff" />
                ) : (
                  <Volume2 size={24} color="#ffffff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePause} accessibilityLabel="Pause game" style={gameStyles.iconRight}>
                <Pause size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Overlays always mounted above game area */}
        {gameState === 'paused' && <PauseOverlay />}
        {gameState === 'gameOver' && <GameOverOverlay />}
      </Pressable>
    </View>
  );
}

