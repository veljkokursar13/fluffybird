
import type { PipePair } from "../entities/pipes";
import { CONFIG } from "../config/settings";

type Rect = { x: number; y: number; width: number; height: number; };

export const collisionStates = {
 TOP_CAP:  'TOP_CAP',
 BOTTOM_CAP: 'BOTTOM_CAP',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
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
  ceilingY: number = 0,
  capHeight: number = (CONFIG.pipe?.pipeCapHeight as number) ?? 16,
  capWidth: number = (CONFIG.pipe?.pipeCapWidth as number) ?? 60,
): CollisionState => {
  // Ground / ceiling checks
  if (bird.y + bird.height >= groundY) {
    return collisionStates.BOTTOM;
  } else if (bird.y <= ceilingY) {
    return collisionStates.TOP;
  } else {
    // Pipe collision checks (caps first)
    for (const pair of pipePairs) {
      // Bottom pipe body (without cap)
      const bottomBodyHeight = Math.max(0, pair.bottom.height - capHeight);
      const bottomPipeBodyRect = {
        x: pair.bottom.pos.x,
        y: pair.bottom.pos.y + capHeight,
        width: pair.bottom.width,
        height: bottomBodyHeight,
      };
      
      // Bottom pipe cap (top of bottom pipe)
      const bottomPipeCapRect: Rect = {
        x: pair.bottom.pos.x - (capWidth - pair.bottom.width) / 2,
        y: pair.bottom.pos.y,
        width: capWidth,
        height: capHeight
      };
      
      // Top pipe body (without cap)
      const topBodyHeight = Math.max(0, pair.top.height - capHeight);
      const topPipeBodyRect = {
        x: pair.top.pos.x,
        y: pair.top.pos.y,
        width: pair.top.width,
        height: topBodyHeight,
      };
      
      // Top pipe cap (bottom of top pipe, rotated)
      const topPipeCapRect: Rect = {
        x: pair.top.pos.x - (capWidth - pair.top.width) / 2,
        y: pair.top.pos.y + pair.top.height - capHeight,
        width: capWidth,
        height: capHeight
      };


      if (intersects(bird, bottomPipeBodyRect)) {
        return collisionStates.BOTTOM;
      }
      
      if (intersects(bird, topPipeBodyRect)) {
        return collisionStates.TOP;
      }
      if (intersects(bird, topPipeCapRect)) {
        return collisionStates.TOP_CAP;
      }
      if (intersects(bird, bottomPipeCapRect)) {
        return collisionStates.BOTTOM_CAP;
      }
    }
  }
  return null;
};