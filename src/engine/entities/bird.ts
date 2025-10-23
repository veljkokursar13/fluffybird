//bird entity

import { CONFIG } from "@/src/engine/config/settings";

export function BirdEntity(): Bird {
  return {
    pos: { x: CONFIG.bird.startX, y: CONFIG.bird.startY },
    vel: { x: 0, y: 0 },
    r: CONFIG.bird.radius,
    size: CONFIG.bird.size,
  };
}

export interface Bird {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  r: number; // radius for collision
  size: number; // size for rendering (square)
}

export type BirdUpdate = Partial<Bird>;

// Consolidated jump booster: tracks consecutive taps and applies multiplier
let consecutiveTaps = 0;
let lastTapTime = 0;

/**
 * Applies a dynamic boost to jump velocity based on rapid consecutive taps.
 * Resets combo chain if gap between taps exceeds 300ms.
 * 
 * @param velocity - Base jump velocity
 * @returns Boosted velocity with multiplier applied
 * 
 * Multipliers:
 * - 1-1 taps: 1.0x (normal)
 * - 2-4 taps: 1.1x (small boost)
 * - 5-9 taps: 1.2x (medium boost)
 * - 10+ taps: 1.3x (max boost)
 */
export function jumpBooster(velocity: number): number {
  const now = Date.now();
  const delta = now - lastTapTime;
  
  // Reset combo chain if time since last tap is too long
  if (delta > 300) {
    consecutiveTaps = 0;
  }
  
  consecutiveTaps = Math.min(consecutiveTaps + 1, 50); // Cap to prevent unbounded growth
  lastTapTime = now;

  // Calculate boost multiplier based on combo count
  let multiplier = 1.0;
  if (consecutiveTaps >= 2 && consecutiveTaps < 5) multiplier = 1.1;
  else if (consecutiveTaps >= 5 && consecutiveTaps < 10) multiplier = 1.2;
  else if (consecutiveTaps >= 10) multiplier = 1.3;

  return velocity * multiplier;
}

/**
 * Returns the current combo count (for UI/debug purposes)
 */
export function getComboCount(): number {
  return consecutiveTaps;
}

/**
 * Resets the jump combo counter (call on game reset)
 */
export function resetCombo(): void {
  consecutiveTaps = 0;
  lastTapTime = 0;
}


export function resetBird(): Bird {
  return {
    pos: { x: CONFIG.bird.startX, y: CONFIG.bird.startY },
    vel: { x: 0, y: 0 },
    r: CONFIG.bird.radius,
    size: CONFIG.bird.size,
  };
}
export function isBirdOutOfBounds(bird: Bird): boolean {
  return bird.pos.y < 0 || bird.pos.y + bird.size > CONFIG.screen.floorY;
}
export function isBirdOnGround(bird: Bird): boolean {
  return bird.pos.y + bird.size >= CONFIG.screen.floorY;
}

export function getBirdRect(bird: Bird) {
  return {
    x: bird.pos.x,
    y: bird.pos.y,
    width: bird.size,
    height: bird.size,
  };
}
