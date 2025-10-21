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
    pipeSpeedMultiplier: 0.5,
    minPipeHeight: 100,
    maxPipeHeight: 300,
    spawnPattern: 'regular',
    randomSpawnChance: 1,
    pipeVariation: 0.3
  },
  medium: {
    pipeGapSize: 220,
    pipeSpawnInterval: 2200,
    pipeSpeedMultiplier: 0.7,
    minPipeHeight: 150,
    maxPipeHeight: 350,
    spawnPattern: 'alternating',
    randomSpawnChance: 0.9,
    pipeVariation: 0.5,
  },
  hard: {
    pipeGapSize: 180,
    pipeSpawnInterval: 1800,
    pipeSpeedMultiplier: 1,
    minPipeHeight: 180,
    maxPipeHeight: 380,
    spawnPattern: 'random',
    randomSpawnChance: 0.85,
    pipeVariation: 0.6,
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
  getPipeGapSize(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.settings.pipeGapSize;
  },
  getSpawnPattern(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.settings.spawnPattern;
  },
  getRandomSpawnChance(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.settings.randomSpawnChance;
  },
  getPipeVariation(level: DifficultyLevel) {
    manager.setDifficulty(level);
    return manager.settings.pipeVariation;
  },
};

// Adaptive difficulty wrapper with basic death-based adjustments
export class AdaptiveDifficulty {
  private manager: DifficultyManager;
  private consecutiveDeaths: number;

  constructor(initialLevel: DifficultyLevel = 'easy') {
    this.manager = new DifficultyManager();
    this.manager.setDifficulty(initialLevel);
    this.consecutiveDeaths = 0;
  }

  updateScore(score: number) {
    this.manager.updateScore(score);
  }

  onDeath() {
    this.consecutiveDeaths += 1;
  }

  onScoreIncrease() {
    this.consecutiveDeaths = 0;
  }

  getCurrentSettings(): DifficultySettings {
    const s = this.manager.settings;
    if (this.consecutiveDeaths >= 3) {
      return {
        ...s,
        pipeGapSize: s.pipeGapSize * 0.8,
        pipeSpawnInterval: s.pipeSpawnInterval * 0.8,
        pipeSpeedMultiplier: s.pipeSpeedMultiplier * 0.8,
        minPipeHeight: s.minPipeHeight * 0.8,
        maxPipeHeight: s.maxPipeHeight * 0.8,
        spawnPattern: s.spawnPattern,
        randomSpawnChance: s.randomSpawnChance,
        pipeVariation: s.pipeVariation,
      };
    }
    return s;
  }

  get pipeGapSize(): number { return this.getCurrentSettings().pipeGapSize; }
  get pipeSpawnInterval(): number { return this.getCurrentSettings().pipeSpawnInterval; }
  get pipeSpeed(): number { return CONFIG.pipe.speed * this.getCurrentSettings().pipeSpeedMultiplier; }
  get minPipeHeight(): number { return this.getCurrentSettings().minPipeHeight; }
  get maxPipeHeight(): number { return this.getCurrentSettings().maxPipeHeight; }
  get spawnPattern(): 'regular' | 'random' | 'alternating' { return this.getCurrentSettings().spawnPattern; }
  get randomSpawnChance(): number { return this.getCurrentSettings().randomSpawnChance; }
  get pipeVariation(): number { return this.getCurrentSettings().pipeVariation; }
}