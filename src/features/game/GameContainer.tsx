import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable } from 'react-native';
import { gameStyles, hudStyles } from '../../styles/styles';
import WorldRenderer from './renderers/WorldRenderer';
import { useGameStore } from '../../store/gameStore';
import useSound from '../../hooks/useSound';
import { useSoundControl } from '../../hooks/useSoundControl';
import gamePlaySound from '@assets/audio/gameplaysound.mp3';
import fluffySoundtrack from '@assets/audio/fluffy-soundtrack.wav';
import { Pause, Volume2, VolumeOff } from 'lucide-react-native';
// UI Overlays
import GameOverOverlay from '../ui/overlays/GameOverOverlay';
import PauseOverlay from '../ui/overlays/PauseOverlay';
import ScoreDisplay from '../ui/common/ScoreDisplay';
import { applyBirdPhysics, checkCollisions } from '../../engine/physics';
import type { Bird } from '../../engine/types';
import { CONFIG } from '../../engine/settings';
import { useTicker } from '../../hooks/useTicker';

export default function GameContainer() {
  const gameState = useGameStore((state) => state.gameState);
  const jump = useGameStore((state) => state.jump);
  const updateBird = useGameStore((state) => state.updateBird);
  const setGameState = useGameStore((state) => state.setGameState);
  const { muted, toggleMuted } = useSoundControl();

  // Menu/overlay soundtrack (controlled by mute, auto-off when playing)
  const menuAudio = useSound(fluffySoundtrack, { autoplay: true, loop: true, volume: 0.6, mute: muted });
  // Gameplay sound (always on during playing, not affected by mute)
  const gameplayAudio = useSound(gamePlaySound, { autoplay: true, loop: true, volume: 0.6, mute: false });
  // Initialize game loop - TEMPORARILY DISABLED FOR TESTING
  // useGameLoop();

  // Ensure HUD/icons render by starting gameplay from menu
  useEffect(() => {
    if (gameState === 'menu') {
      setGameState('playing');
    }
  }, [gameState, setGameState]);

  // Control menu soundtrack by state + mute
  useEffect(() => {
    if (!menuAudio) return;
    (async () => {
      try {
        if (gameState === 'playing') {
          menuAudio?.pause?.();
          await menuAudio?.seekTo?.(0);
        } else {
          if (muted) {
            menuAudio?.pause?.();
          } else {
            menuAudio?.play?.();
          }
        }
      } catch {}
    })();
  }, [gameState, muted, menuAudio]);

  // Control gameplay sound by state only (ignore mute)
  useEffect(() => {
    if (!gameplayAudio) return;
    (async () => {
      try {
        if (gameState === 'playing') {
          gameplayAudio?.play?.();
        } else {
          gameplayAudio?.pause?.();
          await gameplayAudio?.seekTo?.(0);
        }
      } catch {}
    })();
  }, [gameState, gameplayAudio]);

  // (removed) pre-tap physics loop; physics starts only after first tap

  // Start physics only after first tap
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (gameState === 'menu' || gameState === 'gameOver') {
      setHasStarted(false);
    }
  }, [gameState]);

  const tickPhysics = useCallback((dt: number) => {
    if (!hasStarted || gameState !== 'playing') return;
    const current: Bird = useGameStore.getState().bird as Bird;

    const stepped: Bird = {
      pos: { ...current.pos },
      vel: { ...current.vel },
      r: current.r,
    };
    applyBirdPhysics(stepped, CONFIG.physics.gravity, dt);

    const groundY = CONFIG.screen.floorY;
    const skyY = 0;
    const hit = checkCollisions(stepped, [], groundY, skyY);
    if (hit === 'ground') {
      stepped.pos.y = groundY - stepped.r;
      stepped.vel.y = 0;
      updateBird({ pos: stepped.pos, vel: stepped.vel });
      setGameState('gameOver');
      return;
    }
    

    updateBird({ pos: stepped.pos, vel: stepped.vel });
  }, [hasStarted, gameState, updateBird, setGameState]);

  useTicker(tickPhysics);

  const handleTap = () => {
    if (gameState === 'playing') {
      if (!hasStarted) setHasStarted(true);
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
      {/* World (background) + Bird (inside Canvas) */}
      <WorldRenderer />

      {/* Full-screen tap layer (does not cover HUD/overlays visually) */}
      <Pressable onPress={handleTap} style={StyleSheet.absoluteFill} />

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
    </View>
  );
}

