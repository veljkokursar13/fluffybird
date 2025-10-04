// Difficulty presets for game tuning. These can drive spawning/physics scaling.

export type DifficultyKey = 'easy' | 'medium' | 'hard';

export interface DifficultyValues {
    pipeGap: number;    // center gap size between top/bottom pipes (px)
    pipeSpeed: number;  // horizontal pipe movement speed (px/s)
    pipeHeight: number; // individual pipe segment height (px)
}

export const DIFFICULTY: Readonly<Record<DifficultyKey, DifficultyValues>> = {
    easy: {
        pipeGap: 120,
        pipeSpeed: 240,
        pipeHeight: 400,
    },
    medium: {
        pipeGap: 180,
        pipeSpeed: 360,
        pipeHeight: 600,
    },
    hard: {
        pipeGap: 240,
        pipeSpeed: 480,
        pipeHeight: 800,
    },
} as const;

export const DEFAULT_DIFFICULTY: DifficultyKey = 'easy';