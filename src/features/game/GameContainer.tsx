import { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { gameStyles, hudStyles } from '../../styles/styles';
import { WorldRenderer } from './renderers/WorldRenderer';  

import BirdRenderer from './renderers/BirdRenderer';
import { useGameStore } from '../../store/gameStore';
import { Pause } from 'lucide-react-native';
import { useTicker } from '../../hooks/useTicker';
import { CONFIG } from '../../engine/config/settings';
// UI Overlays
import GameOverOverlay from '../ui/overlays/GameOverOverlay';
import PauseOverlay from '../ui/overlays/PauseOverlay';
import ScoreDisplay from '../ui/common/ScoreDisplay';
import { collisionSystem } from '../../engine/systems/collision';
import { PipeRenderer } from './renderers/PipeRenderer';
import { spawningSystem } from '../../engine/systems/spawning';
import type { DifficultyLevel } from '../../engine/config/difficulty';

export default function GameContainer() {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);
  // Control menu soundtrack by state + mute
  

  // (removed) pre-tap physics loop; physics starts only after first tap

  // Start physics only after first tap
  const [hasStarted, setHasStarted] = useState(false);
  const [isBirdDead, setIsBirdDead] = useState(false);

  useEffect(() => {
    if (gameState === 'menu' || gameState === 'gameOver') {
      setHasStarted(false);
     
    } if(gameState === 'playing' && !hasStarted) {
      setHasStarted(true);
      useGameStore.setState((s) => ({ flapTick: s.flapTick > 0 ? s.flapTick : 1 }));
    }
  }, [gameState]);

  // Reset game when bird dies
  useEffect(() => {
    if (isBirdDead) {
      // Brief delay to show game over, then reset
      const timer = setTimeout(() => {
        resetGame();
        setIsBirdDead(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isBirdDead, resetGame]);



  const handlePause = () => {
    setGameState('paused');
  };
  const handleTap = () => {
    const store = useGameStore.getState();
    if (gameState === 'menu') {
      setGameState('playing');
      // ensure physics starts and apply an initial jump for feedback
      useGameStore.setState((s) => ({ flapTick: s.flapTick > 0 ? s.flapTick : 1 }));
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
  const flapTick = useGameStore((state) => state.flapTick);
  const pipes = useGameStore((state) => state.pipes);
  const moving = useGameStore((state) => state.flapTick > 0);
  const score = useGameStore((state) => state.score);
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
    const birdRect = { x: current.pos.x, y: posY, width: current.size, height: current.size };
    const hit = collisionSystem(birdRect, pipes, CONFIG.screen.floorY, 0);
    if (hit && !isBirdDead) {
      store.setGameOverState('gameOver');
      setIsBirdDead(true);
    }


  });

  return (
    <View style={[gameStyles.gameArea, StyleSheet.absoluteFillObject]}>
      <WorldRenderer moving={moving} />
      {/* Pipes should render above world layers, below HUD/overlays */}
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 9 }} pointerEvents="none">
        <PipeRenderer pipes={pipes} />
      </View>

  {/* Bird (with integrated wings) */}
  <BirdRenderer bird={bird} flapTick={flapTick} />

      {/* Full-screen tap layer (does not cover HUD/overlays visually) */}
      <TouchableOpacity onPress={handleTap} activeOpacity={1} style={gameStyles.tapCatcher} />
      {/* HUD while playing */}
      {gameState === 'playing' && (
        <View style={hudStyles.hud} pointerEvents="box-none">
          <ScoreDisplay />
          <View style={gameStyles.iconRow}>
            {/* here will be placed icons once we put the sound settings in the game */}
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



