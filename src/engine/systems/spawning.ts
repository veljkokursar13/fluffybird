// Pipe spawning system: difficulty-driven spawn timing, height, and speed
import { createPipePair } from "../entities/pipes";
import { CONFIG } from "../config/settings";
import { useGameStore } from "@src/store/gameStore";
import { difficultySetting, DifficultyLevel } from "../config/difficulty";

let timeSinceLastSpawn = 0;
let nextSpawnIntervalMs: number | null = null; // sampled per spawn window
const MAX_PIPES_ON_SCREEN = 6; // hard cap to avoid runaway growth

export function resetSpawnTimer() {
  timeSinceLastSpawn = 0;
}

export function spawningSystem(dt: number, level: DifficultyLevel) {
  const speed = difficultySetting.getPipeSpeed(level);
  // Sample interval only when needed; keep constant during countdown
  if (nextSpawnIntervalMs == null) {
    nextSpawnIntervalMs = difficultySetting.getPipeInterval(level);
  }
  const interval = nextSpawnIntervalMs; // ms
  // Gap is sampled only when we actually spawn
  const spawnPattern = difficultySetting.getSpawnPattern(level);
  const randomSpawnChance = difficultySetting.getRandomSpawnChance(level);
  
  timeSinceLastSpawn += dt * 1000;

  useGameStore.setState((state) => {
    // Guard: prevent crashes if state is invalid
    if (!state?.bird || !Array.isArray(state.pipes)) return {};

    // Move existing pipes (mutate in place for performance)
    const speedDelta = speed * dt;
    state.pipes.forEach((pair) => {
      pair.bottom.pos.x -= speedDelta;
      pair.top.pos.x -= speedDelta;
    });

    // Cull off-screen pipes
    const visible = state.pipes.filter((pair) => pair.bottom.pos.x >= -pair.bottom.width);

    // Ensure an initial pipe exists when starting the game
    let working = visible;
    if (working.length === 0 && state.gameState === 'playing') {
      const startX = CONFIG.screen.width + 20;
      // Sample gap only when spawning
      const initialGap = difficultySetting.getPipeGap(level);
      const pair = createPipePair(startX, initialGap);
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

    // Spawn if interval elapsed (apply difficulty patterning)
    let next = scoredCheck;
    if (timeSinceLastSpawn >= interval) {
      timeSinceLastSpawn = 0;
      // Resample next interval for the coming window
      nextSpawnIntervalMs = difficultySetting.getPipeInterval(level);
      const startX = CONFIG.screen.width + 20;

      let shouldSpawn = true;
      if (spawnPattern === 'random') {
        shouldSpawn = Math.random() < randomSpawnChance;
      }
      // 'alternating' can skip every other tick by chance to create rhythm
      if (spawnPattern === 'alternating' && Math.random() < 0.33) {
        shouldSpawn = false;
      }

      if (shouldSpawn) {
        // Sample gap size only now to avoid per-frame randomness
        const gapSize = difficultySetting.getPipeGap(level);
        // Enforce a safe cap on visible pipe pairs
        if (scoredCheck.length < MAX_PIPES_ON_SCREEN) {
          const pair = createPipePair(startX, gapSize);
          next = [...scoredCheck, pair];
        } else {
          next = scoredCheck;
        }
      } else {
        next = scoredCheck;
      }
    }

    // Apply score increment and updated pipes
    const newScore = scoreInc > 0 ? state.score + scoreInc : state.score;
    return scoreInc > 0 ? { pipes: next, score: newScore, bestScore: Math.max(newScore, state.bestScore) } : { pipes: next };
  });
}
