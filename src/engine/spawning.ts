import type { Pipe } from "./types";
import { CONFIG } from "./settings";

// Pipe spawning helpers
// - Bottom pipe anchors its body on the ground top (floorY)
// - Cap is rendered by the sprite component directly above the body

/**
 * Create a single bottom pipe whose body sits on the ground.
 * The returned pipe's pos.y is the ground-top, matching the renderer's
 * expectation that for orientation "bottom" the body extends upward from y.
 */
export function createBottomPipe(x: number, bodyHeight: number = CONFIG.pipe.height): Pipe {
  return {
    pos: { x, y: CONFIG.screen.floorY },
    size: { width: CONFIG.pipe.width, height: bodyHeight },
    orientation: "bottom",
  };
}

/**
 * Create a single top pipe whose body hangs down from the given y (default: 0)
 * For orientation "top", the renderer draws the body downward from y.
 */
export function createTopPipe(x: number, y: number = 0, bodyHeight: number = CONFIG.pipe.height): Pipe {
  return {
    pos: { x, y },
    size: { width: CONFIG.pipe.width, height: bodyHeight },
    orientation: "top",
  };
}

/**
 * Compute the Y anchor for a pipe based on its orientation.
 * - bottom => ground top (floorY)
 * - top => 0 (screen top)
 */
export function getPipeStartY(orientation: Pipe["orientation"]): number {
  return orientation === "bottom" ? CONFIG.screen.floorY : 0;
}