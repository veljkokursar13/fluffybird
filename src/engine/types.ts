// Only data structure definitions
export interface Bird {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  r: number;
}

export interface Pipe {
  pos: { x: number; y: number };
  size: { width: number; height: number };
  speed: number;
  gapY: number;  // Center of the gap between top and bottom pipe
}

export type Config = {
  screen: { width: number; height: number; floorY: number };
  bird: { size: number; startX: number; startY: number; radius: number };
  physics: { gravity: number; jumpVelocity: number; maxFallSpeed: number; dt: number };
  pipe: { 
    width: number; 
    speed: number; 
    // Gap between top and bottom pipe in a pair
    minGap: number;
    maxGap: number;
    // Spacing between consecutive pipe pairs
    minSpacing: number;
    maxSpacing: number;
    height: number; // Individual pipe height
  };
};