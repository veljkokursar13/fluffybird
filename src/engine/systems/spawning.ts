// Pipe spawning system: difficulty-driven spawn timing, height, and speed
import { createPipePair } from "../entities/pipes";
import { CONFIG } from "../config/settings";
import { useGameStore } from "@src/store/gameStore";
import { difficultySetting, DifficultyLevel } from "../config/difficulty";

let timeSinceLastSpawn = 0;

export function spawningSystem(dt: number, level: DifficultyLevel) {
  const speed = difficultySetting.getPipeSpeed(level);
  const interval = difficultySetting.getPipeInterval(level); // ms

  timeSinceLastSpawn += dt * 1000;

  useGameStore.setState((state) => {
    // Move existing pipes
    const moved = state.pipes.map((pair) => ({
      ...pair,
      bottom: {
        ...pair.bottom,
        pos: { ...pair.bottom.pos, x: pair.bottom.pos.x - speed * dt },
      },
      top: {
        ...pair.top,
        pos: { ...pair.top.pos, x: pair.top.pos.x - speed * dt },
      },
    }));

    // Cull
    const visible = moved.filter((pair) => pair.bottom.pos.x >= -pair.bottom.width);

    // Ensure an initial pipe exists when starting the game
    let working = visible;
    if (working.length === 0 && state.gameState === 'playing') {
      const startX = CONFIG.screen.width + 20;
      const pair = createPipePair(startX);
      working = [pair];
      timeSinceLastSpawn = 0;
    }

    // Increment score when a pipe pair fully passes the bird's center (once per pair)
    let scoreInc = 0;
    const birdCenterX = state.bird.pos.x + state.bird.size / 2;
    const scoredCheck = working.map((pair) => {
      if (!pair.scored && pair.bottom.pos.x + pair.bottom.width < birdCenterX) {
        scoreInc += 1;
        return { ...pair, scored: true };
      }
      return pair;
    });

    // Spawn if interval elapsed
    let next = scoredCheck;
    if (timeSinceLastSpawn >= interval) {
      timeSinceLastSpawn = 0;
      const startX = CONFIG.screen.width + 20;
      const pair = createPipePair(startX);
      next = [...scoredCheck, pair];
    }

    // Apply score increment and updated pipes
    const newScore = scoreInc > 0 ? state.score + scoreInc : state.score;
    return scoreInc > 0 ? { pipes: next, score: newScore, bestScore: Math.max(newScore, state.bestScore) } : { pipes: next };
  });
}