// Pipe spawning system: difficulty-driven spawn timing, height, and speed
import { createPipePair } from "../entities/pipes";
import { CONFIG } from "../config/settings";
import { useGameStore } from "@src/store/gameStore";
import { difficultySetting, DifficultyLevel, AdaptiveDifficulty } from "../config/difficulty";

let timeSinceLastSpawn = 0;
let nextSpawnIntervalMs: number | null = null; // sampled per spawn window
const MAX_PIPES_ON_SCREEN = 6; // hard cap to avoid runaway growth
// Track previous gap characteristics to create smooth variation
let lastGapCenter: number | null = null;
let lastGapSize: number | null = null;

export function resetSpawnTimer() {
  timeSinceLastSpawn = 0;
  nextSpawnIntervalMs = null;
  lastGapCenter = null;
  lastGapSize = null;
}

export function spawningSystem(dt: number, level: DifficultyLevel, adaptiveDifficulty?: AdaptiveDifficulty) {
  // Use adaptive difficulty if provided, otherwise fall back to static settings
  const settings = adaptiveDifficulty?.getCurrentSettings() ?? {
    pipeGapSize: difficultySetting.getPipeGapSize(level),
    pipeSpawnInterval: difficultySetting.getPipeInterval(level),
    pipeSpeedMultiplier: difficultySetting.getPipeSpeed(level) / CONFIG.pipe.speed,
    spawnPattern: difficultySetting.getSpawnPattern(level),
    randomSpawnChance: difficultySetting.getRandomSpawnChance(level),
    pipeVariation: difficultySetting.getPipeVariation(level),
  };
  
  const speed = CONFIG.pipe.speed * settings.pipeSpeedMultiplier;
  // Sample interval only when needed; keep constant during countdown
  if (nextSpawnIntervalMs == null) {
    nextSpawnIntervalMs = settings.pipeSpawnInterval;
  }
  const interval = nextSpawnIntervalMs; // ms
  // Gap is sampled only when we actually spawn
  const spawnPattern = settings.spawnPattern;
  const randomSpawnChance = settings.randomSpawnChance;
  
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
      const baseGap = settings.pipeGapSize;
      const variation = settings.pipeVariation;
      const spanPx = Math.max(40, (CONFIG.pipe.maxGap - CONFIG.pipe.minGap) * 0.25);
      const initialGap = Math.max(
        CONFIG.pipe.minGap,
        Math.min(CONFIG.pipe.maxGap, Math.round(baseGap + (Math.random() * 2 - 1) * spanPx * variation))
      );
      const pair = createPipePair(startX, initialGap);
      // Derive and store initial center for smoother subsequent spawns
      lastGapSize = pair.gap;
      lastGapCenter = pair.bottom.pos.y - pair.gap / 2;
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
      nextSpawnIntervalMs = settings.pipeSpawnInterval;
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
        const baseGap = settings.pipeGapSize;
        const variation = settings.pipeVariation;
        const spanPx = Math.max(40, (CONFIG.pipe.maxGap - CONFIG.pipe.minGap) * 0.25);
        // Vary gap within safe bounds based on difficulty variation
        let gapSize = Math.round(baseGap + (Math.random() * 2 - 1) * spanPx * variation);
        gapSize = Math.max(CONFIG.pipe.minGap, Math.min(CONFIG.pipe.maxGap, gapSize));

        // Compute next gap center with improved vertical variation
        const floorY = CONFIG.screen.floorY;
        const minCenter = gapSize / 2 + 50;
        const maxCenter = floorY - gapSize / 2 - 50;
        const maxStep = 180 * (0.5 + 0.5 * variation); // Increased base step for more variation
        let proposedCenter: number;
        
        // Occasionally force dramatic position changes (25% chance)
        const shouldForceVariation = Math.random() < 0.25;
        if (shouldForceVariation && lastGapCenter != null) {
          // Force a jump to a different vertical zone
          const zones = [minCenter + 60, (minCenter + maxCenter) / 2, maxCenter - 60];
          proposedCenter = zones[Math.floor(Math.random() * zones.length)];
        } else {
          // Normal smooth variation
          proposedCenter =
            lastGapCenter == null
              ? (minCenter + Math.random() * (maxCenter - minCenter))
              : lastGapCenter + (Math.random() * 2 - 1) * maxStep;
        }
        // Clamp within playable bounds
        proposedCenter = Math.max(minCenter, Math.min(maxCenter, proposedCenter));

        // Avoid back-to-back extreme flips (relaxed threshold)
        const isPrevTopExtreme = lastGapCenter != null && (lastGapCenter - minCenter) < 20;
        const isPrevBottomExtreme = lastGapCenter != null && (maxCenter - lastGapCenter) < 20;
        const isNextTopExtreme = (proposedCenter - minCenter) < 20;
        const isNextBottomExtreme = (maxCenter - proposedCenter) < 20;
        if ((isPrevTopExtreme && isNextBottomExtreme) || (isPrevBottomExtreme && isNextTopExtreme)) {
          proposedCenter = (minCenter + maxCenter) / 2;
        }
        // Enforce a safe cap on visible pipe pairs
        if (scoredCheck.length < MAX_PIPES_ON_SCREEN) {
          const pair = createPipePair(startX, gapSize, proposedCenter);
          lastGapSize = pair.gap;
          lastGapCenter = proposedCenter;
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
