// Pipe spawning system: difficulty-driven spawn timing, height, and speed
import { PipeEntity } from "../entities/pipes";
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
    const moved = state.pipes.map((p) => ({
      ...p,
      pos: { ...p.pos, x: p.pos.x - speed * dt },
    }));

    // Cull
    const visible = moved.filter((p) => p.pos.x >= -p.width);

    // Spawn if interval elapsed
    let next = visible;
    if (timeSinceLastSpawn >= interval) {
      timeSinceLastSpawn = 0;
      const minH = difficultySetting.getMinPipeHeight(level);
      const maxH = difficultySetting.getMaxPipeHeight(level);
      const height = Math.floor(minH + Math.random() * Math.max(1, maxH - minH));
      const startX = CONFIG.screen.width + 20;
      const pipe = PipeEntity(startX, 0, { width: CONFIG.pipe.width, height });
      next = [...visible, pipe];
    }

    return { pipes: next };
  });
}