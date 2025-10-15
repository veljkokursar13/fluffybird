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

let consecutiveFlaps = 0;
let lastFlapTime = 0;
// Separate counters for jump booster based on consecutive taps
let consecutiveTaps = 0;
let lastTapTime = 0;

// Bird flapping logic with jump boost mechanics
export function flap(bird: Bird): Bird {
  const now = Date.now();
  const timeSinceLastFlap = now - lastFlapTime;
  
  // Reset consecutive flaps if too much time has passed
  if (timeSinceLastFlap > 300) { // Reset after 300ms
    consecutiveFlaps = 0;
  }
  
  // Increment consecutive flaps
  consecutiveFlaps = Math.min(consecutiveFlaps + 1, 3);
  lastFlapTime = now;

  // Calculate boosted velocity
  const baseVelocity = CONFIG.bird.flapVelocity;
  const boostMultiplier = getBoostMultiplier(consecutiveFlaps);
  const boostedVelocity = baseVelocity * boostMultiplier;

  return {
    ...bird,
    vel: { x: bird.vel.x, y: boostedVelocity },
  };
}

// Helper function to calculate boost multiplier based on consecutive flaps
function getBoostMultiplier(flaps: number): number {
  switch (flaps) {
    case 1: return 1.0;    // Normal jump
    case 2: return 1.1;    // Small boost
    case 3: return 1.2;    // Maximum boost
    default: return 1.0;
  }
}
// Applies a dynamic boost to jump velocity based on rapid consecutive taps
// Resets if the gap between taps exceeds the threshold
export function jumpBooster(velocity: number): number {
  const now = Date.now();
  const delta = now - lastTapTime;
  // Reset chain if time since last tap is too long
  if (delta > 300) {
    consecutiveTaps = 0;
  }
  consecutiveTaps = Math.min(consecutiveTaps + 1, 50); // prevent unbounded growth
  lastTapTime = now;

  let multiplier = 1.0;
  if (consecutiveTaps > 1 && consecutiveTaps < 5) multiplier = 1.1;
  else if (consecutiveTaps >= 5 && consecutiveTaps < 10) multiplier = 1.2;
  else if (consecutiveTaps >= 10) multiplier = 1.3;

  return velocity * multiplier;
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
