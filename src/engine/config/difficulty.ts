import { CONFIG } from './settings';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface DifficultySettings {
  pipeGapSize: number;
  pipeSpawnInterval: number;
  pipeSpeedMultiplier: number;
  minPipeHeight: number;
  maxPipeHeight: number;
  spawnPattern: 'regular' | 'random' | 'alternating';
  randomSpawnChance: number; // Chance of spawning a pipe (0-1)
  pipeVariation: number; // How much pipes can vary in height (0-1)
}

const difficultySettings: Record<DifficultyLevel, DifficultySettings> = {
  easy: {
    pipeGapSize: 280,
    pipeSpawnInterval: 2800,
    pipeSpeedMultiplier: 0.7,
    minPipeHeight: 100,
    maxPipeHeight: 300,
    spawnPattern: 'regular',
    randomSpawnChance: 1,
    pipeVariation: 0.3
  },
  medium: {
    pipeGapSize: 220,
    pipeSpawnInterval: 2200,
    pipeSpeedMultiplier: 1.0,
    minPipeHeight: 150,
    maxPipeHeight: 350,
    spawnPattern: 'alternating',
    randomSpawnChance: 0.9,
    pipeVariation: 0.5
  },
  hard: {
    pipeGapSize: 180,
    pipeSpawnInterval: 1600,
    pipeSpeedMultiplier: 1.5,
    minPipeHeight: 200,
    maxPipeHeight: 400,
    spawnPattern: 'random',
    randomSpawnChance: 0.8,
    pipeVariation: 0.7
  },
};

class DifficultyManager {
  private currentLevel: DifficultyLevel = 'easy';
  private score: number = 0;

  setDifficulty(level: DifficultyLevel) {
    this.currentLevel = level;
  }

  updateScore(score: number) {
    this.score = score;
    this.adjustDifficultyByScore();
  }

  private adjustDifficultyByScore() {
    if (this.score >= 50) {
      this.currentLevel = 'hard';
    } else if (this.score >= 20) {
      this.currentLevel = 'medium';
    }
  }

  get settings(): DifficultySettings {
    return difficultySettings[this.currentLevel];
  }

  get pipeGapSize(): number {
    return this.settings.pipeGapSize;
  }

  get pipeSpawnInterval(): number {
    return this.settings.pipeSpawnInterval;
  }

  get pipeSpeed(): number {
    return CONFIG.pipe.speed * this.settings.pipeSpeedMultiplier;
  }

  get minPipeHeight(): number {
    return this.settings.minPipeHeight;
  }

  get maxPipeHeight(): number {
    return this.settings.maxPipeHeight;
  }
}

const manager = new DifficultyManager();
export default manager;

// Convenience API expected by spawning system: level-in, value-out
export const difficultySetting = {
  setDifficulty(level: DifficultyLevel) {
    manager.setDifficulty(level);
  },
  getPipeGap(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.pipeGapSize;
  },
  getPipeInterval(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.pipeSpawnInterval;
  },
  getPipeSpeed(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.pipeSpeed;
  },
  getMinPipeHeight(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.minPipeHeight;
  },
  getMaxPipeHeight(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.maxPipeHeight;
  },
};