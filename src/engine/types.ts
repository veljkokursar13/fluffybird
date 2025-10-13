export interface Config {
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
    minGap: number;
    maxGap: number;
    minSpacing: number;
    maxSpacing: number;
  };
}

export interface Vec2 {
  x: number;
  y: number;
}