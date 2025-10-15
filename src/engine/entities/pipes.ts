//all the pipe entity related code goes here

import { CONFIG } from "../config/settings";

export interface Pipe {
  pos: { x: number; y: number };
  width: number;
  height: number;
}

export interface PipePair {
  bottom: Pipe;
  top: Pipe;
  scored?: boolean; // whether this pipe pair has already contributed to the score
  gap: number; // gap size between top and bottom pipes
}

// Safe config reads with fallbacks
const PIPE_WIDTH = CONFIG.pipe?.width ?? 50;
const PIPE_HEIGHT = CONFIG.pipe?.height ?? 200;
const MIN_GAP = CONFIG.pipe?.minGap ?? 120;
const MAX_GAP = CONFIG.pipe?.maxGap ?? 180;

export function createPipePair(x: number, gapCenter?: number): PipePair {
  const screenHeight = CONFIG.screen.height;
  const floorY = CONFIG.screen.floorY;
  // Use a larger gap for better playability - roughly 3.5x bird size
  const gap = Math.max(MIN_GAP, 170);
  
  // If no gap center provided, position gap randomly in middle 60% of playable area
  const playableHeight = floorY - 0; // from top to floor
  const minGapCenter = gap / 2 + 50; // 50px margin from top
  const maxGapCenter = floorY - gap / 2 - 50; // 50px margin from floor
  const finalGapCenter = gapCenter ?? (minGapCenter + Math.random() * (maxGapCenter - minGapCenter));
  
  // Bottom pipe extends up from ground
  const bottomPipeTop = finalGapCenter + gap / 2;
  const bottomPipeHeight = floorY - bottomPipeTop;
  
  // Top pipe extends down from ceiling
  const topPipeBottom = finalGapCenter - gap / 2;
  const topPipeHeight = topPipeBottom;
  
  return {
    bottom: {
      pos: { x, y: bottomPipeTop },
      width: PIPE_WIDTH,
      height: bottomPipeHeight,
    },
    top: {
      pos: { x, y: 0 },
      width: PIPE_WIDTH,
      height: topPipeHeight,
    },
    scored: false,
    gap,
  };
}