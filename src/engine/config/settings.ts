// Only configuration values
import { Dimensions } from 'react-native';
type Config = {
  screen: {
    width: number;  
    height: number;
    floorY: number;
  };
  bird: {
    size: number;
    startX: number;
    startY: number;
    radius: number;
    flapVelocity: number;
    flapCycle: number;
    jumpBoost: number; // Jump boost factor for add more jump height
  };
  physics: {
    gravity: number;
    jumpVelocity: number;
    maxFallSpeed: number;
    dt: number;
  };
  pipe: {
    width: number;
    speed: number;
    height: number;
    pipeCap: number;
    minGap: number;
    maxGap: number;
    minSpacing: number;
    maxSpacing: number;
    capWidth: number;
    capHeight: number;
  };
};

const { width, height } = Dimensions.get('window');

export const CONFIG: Readonly<Config> = {
  screen: { width, height, floorY: height - 100 },
  bird: {
    size: 48,
    startX: Math.round(width * 0.25),
    startY: Math.round(height * 0.5),
    radius: Math.round(width * 0.05),
    flapVelocity: -480,
    flapCycle: 30,
    jumpBoost: 1.2 // Number of frames for a complete flap cycle
  },
  physics: {
    gravity: 1000,
    jumpVelocity: -280,
    maxFallSpeed: 400,
    dt: 1 / 60,
  },
  pipe: {
    width: 80,
    speed: 240,
    height: 400, // Individual pipe segment height

    // Gap between top and bottom pipe in a pair
    pipeCap: 180,
    minGap: 120,
    maxGap: 180,
    minSpacing: 200,
    maxSpacing: 300,
    capWidth: 100,
    capHeight: 50,
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
export const PIPE_CAP_WIDTH = CONFIG.pipe.capWidth;
export const PIPE_CAP_HEIGHT = CONFIG.pipe.capHeight;
