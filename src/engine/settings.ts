import { Dimensions } from 'react-native';

// Screen
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bird
export const BIRD_SIZE = 48;
export const BIRD_START_X = Math.round(SCREEN_WIDTH * 0.25);
export const BIRD_START_Y = Math.round(SCREEN_HEIGHT * 0.5);

// Physics
export const GRAVITY = 1400;      // px / sec^2
export const JUMP_VELOCITY = -480; // px / sec (negative = up)
export const MAX_FALL_SPEED = 900; // clamp fall speed

// Pipes
export const PIPE_WIDTH = 80;
export const PIPE_SPACING = 220;   // horizontal distance between pipes
export const PIPE_GAP = 160;       // vertical gap between top and bottom pipe
export const PIPE_SPEED = 240;     // px / sec scrolling speed

// Ground (optional, for floor line)
export const GROUND_HEIGHT = 80;

// Game
export const FPS = 1 / 60; 