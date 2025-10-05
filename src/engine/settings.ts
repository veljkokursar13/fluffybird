// Only configuration values
import { Dimensions } from 'react-native';
import type { Config } from './types';

const { width, height } = Dimensions.get('window');

export const CONFIG: Readonly<Config> = {
  screen: { width, height, floorY: height - 100 },
  bird: {
    size: 48,
    startX: Math.round(width * 0.25),
    startY: Math.round(height * 0.5),
    radius: Math.round(width * 0.05),
  },
  physics: {
    gravity: 1400,
    jumpVelocity: -480,
    maxFallSpeed: 900,
    dt: 1 / 60,
  },
  pipe: {
    width: 80,
    speed: 240,
    height: 400, // Individual pipe segment height
    // Gap between top and bottom pipe in a pair
    minGap: 120,  // Minimum gap for bird to pass through
    maxGap: 180,  // Maximum gap (easier)
    // Spacing between consecutive pipe pairs
    minSpacing: 200, // Minimum distance between pipe pairs
    maxSpacing: 300, // Maximum distance between pipe pairs
  },
};

// Legacy exports for backward compatibility
export const BIRD_SIZE = CONFIG.bird.size;
export const BIRD_START_X = CONFIG.bird.startX;
export const BIRD_START_Y = CONFIG.bird.startY;
export const GRAVITY = CONFIG.physics.gravity;
export const JUMP_VELOCITY = CONFIG.physics.jumpVelocity;
export const MAX_FALL_SPEED = CONFIG.physics.maxFallSpeed;
export const PIPE_WIDTH = CONFIG.pipe.width;
export const PIPE_SPEED = CONFIG.pipe.speed;
export const GROUND_HEIGHT = CONFIG.screen.floorY;
export const FPS = 1 / 60; 
