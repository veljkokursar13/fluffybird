import { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { gameStyles, hudStyles } from '../../styles/styles';
import { WorldRenderer } from './renderers/WorldRenderer';  

import BirdRenderer from './renderers/BirdRenderer';
import { useGameStore } from '../../store/gameStore';
import { Pause, Volume2, VolumeX } from 'lucide-react-native';
import { useTicker } from '../../hooks/useTicker';
import { CONFIG } from '../../engine/config/settings';
// UI Overlays
import GameOverOverlay from '../ui/overlays/GameOverOverlay';
import PauseOverlay from '../ui/overlays/PauseOverlay';
import ScoreDisplay from '../ui/common/ScoreDisplay';
import { collisionSystem } from '../../engine/systems/collision';
import { PipeRenderer } from './renderers/PipeRenderer';
import { spawningSystem, resetSpawnTimer } from '../../engine/systems/spawning';
import type { DifficultyLevel } from '../../engine/config/difficulty';

import { useSoundStore } from '@/src/sound/soundStore';

const pipeContainerStyle = { position: 'absolute' as const, left: 0, top: 0, right: 0, bottom: 0, zIndex: 9 };

export default function GameContainer() {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);
  const clearGameCache = useGameStore((state) => state.clearGameCache);
  const muted = useSoundStore((s) => s.muted);
  const toggleMute = useSoundStore((s) => s.toggleMute);
  const stopBgm = useSoundStore((s) => s.stopBgm);
  const playSound = useSoundStore((s) => s.playSound);
 
  // Stop any menu soundtrack when entering the game screen
  useEffect(() => {
    stopBgm();
  }, [stopBgm]);
 
  // Clear game cache and reset spawn timer when game ends
  useEffect(() => {
    if (gameState === 'gameOver') {
      clearGameCache();
      resetSpawnTimer();
    }
  }, [gameState, clearGameCache]);

  // Start physics only after first tap
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (gameState === 'menu' || gameState === 'gameOver') {
      setHasStarted(false);
     
    } if(gameState === 'playing' && !hasStarted) {
      setHasStarted(true);
    }
  }, [gameState]);

  const handlePause = () => {
    setGameState('paused');
  };
  const handleTap = () => {
    playSound('gameplaysound');

    const store = useGameStore.getState();
    if (gameState === 'menu') {
      setGameState('playing');
      // next frame to ensure state transition is reflected
      requestAnimationFrame(() => store.jump());
      return;
    }
    if (gameState === 'playing') {
      store.jump();
      return;
    }
  };

  const bird = useGameStore((state) => state.bird);
  const pipes = useGameStore((state) => state.pipes);
  const jumpTick = useGameStore((state) => state.jumpTick);
  const moving = gameState === 'playing';
  const score = useGameStore((state) => state.score);
  
  // Only render pipes during gameplay (clear immediately on game over for clean transition)
  const pipesToRender = gameState === 'playing' ? pipes : [];
  
  // Physics: apply gravity and integrate only after first tap
  useTicker((dt) => {
    const store = useGameStore.getState();
    if (store.gameState !== 'playing') return;
    const current = store.bird;
    const gravity = CONFIG.physics.gravity;
    const maxFall = CONFIG.physics.maxFallSpeed;

    let velY = current.vel.y;
    let posY = current.pos.y;
    // Apply gravity immediately once playing
    velY = current.vel.y + gravity * dt;
    if (velY > maxFall) velY = maxFall;
    posY = current.pos.y + velY * dt;

    const floorClampY = CONFIG.screen.floorY - current.size;
    if (posY > floorClampY) {
      posY = floorClampY;
      velY = 0;
    }
    if (posY < 0) {
      posY = 0;
      velY = 0;
    }

    store.updateBird({
      pos: { x: current.pos.x, y: posY },
      vel: { x: current.vel.x, y: velY },
    });

    // Difficulty based on score thresholds
    let level: DifficultyLevel = 'easy';
    if (score >= 50) level = 'hard';
    else if (score >= 20) level = 'medium';
    // Spawn/move pipes according to difficulty
    spawningSystem(dt, level);

    // Collision check against ground/ceiling and pipes (if any)
    // Skip collision if no pipes exist (performance optimization)
    if (pipes.length > 0) {
      const birdRect = { x: current.pos.x, y: posY, width: current.size, height: current.size };
      const hit = collisionSystem(birdRect, pipes, CONFIG.screen.floorY, 0);
      if (hit) {
        store.setGameOverState('gameOver');
      }
    }


  });

  return (
    <View style={[gameStyles.gameArea, StyleSheet.absoluteFillObject]}>
      <WorldRenderer moving={moving} />
      {/* Pipes should render above world layers, below HUD/overlays */}
      <View style={pipeContainerStyle} pointerEvents="none">
        <PipeRenderer pipes={pipesToRender} />
      </View>

  {/* Bird (with integrated wings) */}
      <BirdRenderer bird={bird} jumpTick={jumpTick} />

      {/* Full-screen tap layer (does not cover HUD/overlays visually) */}
      <TouchableOpacity onPress={handleTap} activeOpacity={1} style={gameStyles.tapCatcher} />
      {/* HUD while playing */}
      {gameState === 'playing' && (
        <View style={hudStyles.hud} pointerEvents="box-none">
          <ScoreDisplay />
          <View style={gameStyles.iconRow}>
            <TouchableOpacity onPress={handlePause} accessibilityLabel="Pause game" style={gameStyles.iconRight}>
              <Pause size={30} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleMute} accessibilityLabel="Toggle mute" style={gameStyles.iconRight}>
              {muted ? <VolumeX size={30} color="#ffffff" /> : <Volume2 size={30} color="#ffffff" />}
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



