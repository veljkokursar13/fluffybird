//all the pipe entity related code goes here

import { CONFIG } from "../config/settings";

export interface Pipes {
  pos: { x: number; y: number };
  width: number;
  height: number;
}

export interface PipeCap {
  pos: { x: number; y: number };
  width: number;
  height: number;
}

// Safe config reads with fallbacks
const PIPE_WIDTH = CONFIG.pipe?.width ?? 50;
const PIPE_HEIGHT = CONFIG.pipe?.height ?? 200;
const CAP_WIDTH = CONFIG.pipe?.capWidth ?? PIPE_WIDTH;
const CAP_HEIGHT = CONFIG.pipe?.capHeight ?? Math.round(PIPE_WIDTH * 0.6);

export function PipeEntity(x: number, y: number, opts?: { width?: number; height?: number }): Pipes {
  return {
    pos: { x, y },
    width: opts?.width ?? PIPE_WIDTH,
    height: opts?.height ?? PIPE_HEIGHT,
  };
}

// Convenience: create a pipe with given height at ground, starting off-screen right
export function createGroundPipe(x: number, height: number, width?: number): Pipes {
  return PipeEntity(x, 0, { width, height });
}

export function PipeCapEntity(x: number, y: number): PipeCap {
  return {
    pos: { x, y },
    width: CAP_WIDTH,
    height: CAP_HEIGHT,
  };
}