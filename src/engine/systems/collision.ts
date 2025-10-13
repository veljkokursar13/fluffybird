//collision system goes here

type Rect = { x: number; y: number; width: number; height: number; };

export const collisionStates = {
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
  pipes: Rect[],
  groundY: number,
  ceilingY: number = 0
): CollisionState => {
  if (groundY <= bird.y + bird.height) {
    return collisionStates.BOTTOM;
  } else if (ceilingY >= bird.y) {
    return collisionStates.TOP;
  } else {
    for (const pipe of pipes) {
      if (intersects(bird, pipe)) {
        // Determine if collision is from top or bottom based on bird's position
        if (bird.y + bird.height / 2 < pipe.y + pipe.height / 2) {
          return collisionStates.TOP;
        } else {
          return collisionStates.BOTTOM;
        }
      }
    }
  }
  return null;
};