// Only data structure definitions
export interface Bird {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  r: number;
}

// Renderable pipe entity used across physics, spawning, and rendering
export interface Pipe {
  pos: { x: number; y: number }; // Anchor Y: top for "top" pipes, ground-top for "bottom" pipes
  size: { width: number; height: number }; // Body dimensions (cap thickness handled by renderer)
  orientation: "top" | "bottom";
}

export type PipeRects = {
body: { x: number; y: number; width: number; height: number };
cap: { x: number; y: number; width: number; height: number };
};

export function PipeRects(
  x: number,
  width: number,
  yTop: number,
  topH: number,
  yBottom: number,
  bottomH: number
): PipeRects {
  return {
    body: { x, y: yTop, width, height: topH },
    cap: { x, y: yBottom, width, height: bottomH },
  };
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