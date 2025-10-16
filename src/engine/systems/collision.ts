
import type { PipePair } from "../entities/pipes";
import { CONFIG } from "../config/settings";

type Rect = { x: number; y: number; width: number; height: number; };

export const collisionStates = {
  CAP: 'cap',
  TOP: 'top',
  BOTTOM: 'bottom',
} as const;

type CollisionState = typeof collisionStates[keyof typeof collisionStates] | null;

const intersects = (a: Rect, b: Rect): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

export const collisionSystem = (
  bird: Rect,
  pipePairs: PipePair[],
  groundY: number,
  ceilingY: number = 0
): CollisionState => {
  if (groundY <= bird.y + bird.height) {
    return collisionStates.BOTTOM;
  } else if (ceilingY >= bird.y) {
    return collisionStates.TOP;
  } else {
    // Get cap dimensions from config
    const capHeight = CONFIG.pipe.pipeCapHeight;
    const capWidth = CONFIG.pipe.pipeCapWidth;
    
    for (const pair of pipePairs) {
      // Bottom pipe body (without cap)
      const bottomPipeBodyRect = { 
        x: pair.bottom.pos.x, 
        y: pair.bottom.pos.y + capHeight, 
        width: pair.bottom.width, 
        height: pair.bottom.height - capHeight 
      };
      
      // Bottom pipe cap (top of bottom pipe)
      const bottomPipeCapRect: Rect = {
        x: pair.bottom.pos.x - (capWidth - pair.bottom.width) / 2,
        y: pair.bottom.pos.y,
        width: capWidth,
        height: capHeight
      };
      
      // Top pipe body (without cap)
      const topPipeBodyRect = { 
        x: pair.top.pos.x, 
        y: pair.top.pos.y, 
        width: pair.top.width, 
        height: pair.top.height - capHeight 
      };
      
      // Top pipe cap (bottom of top pipe, rotated)
      const topPipeCapRect: Rect = {
        x: pair.top.pos.x - (capWidth - pair.top.width) / 2,
        y: pair.top.pos.y + pair.top.height - capHeight,
        width: capWidth,
        height: capHeight
      };


      // Check collisions - caps first for priority
      if (intersects(bird, bottomPipeCapRect) || intersects(bird, topPipeCapRect)) {
        return collisionStates.CAP;
      }
      
      if (intersects(bird, bottomPipeBodyRect)) {
        return collisionStates.BOTTOM;
      }
      
      if (intersects(bird, topPipeBodyRect)) {
        return collisionStates.TOP;
      }
      if (intersects(bird, topPipeCapRect)) {
        return collisionStates.CAP;
      }
    }
    

  }
  return null;
};