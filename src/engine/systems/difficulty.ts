// Difficulty presets for game tuning. These can drive spawning/physics scaling.

export type DifficultyKey = 'easy' | 'medium' | 'hard';

export interface DifficultyValues {
    pipeGap: number;    // center gap size between top/bottom pipes (px)
    pipeSpeed: number;  // horizontal pipe movement speed (px/s)
    pipeHeight: number; // individual pipe segment height (px)
    pipeNextPrevGap: number; // gap between next and previous pipe (px)
}

export const DIFFICULTY: Readonly<Record<DifficultyKey, DifficultyValues>> = {
    easy: {
        pipeGap: 120,
        pipeSpeed: 100,
        pipeHeight: 400,
        pipeNextPrevGap: 120,
    },
    medium: {
        pipeGap: 180,
        pipeSpeed: 120,
        pipeHeight: 600,
        pipeNextPrevGap: 180,
    },
    hard: {
        pipeGap: 240,
        pipeSpeed: 140,
        pipeHeight: 800,
        pipeNextPrevGap: 240,
    },
} as const;

export const DEFAULT_DIFFICULTY: DifficultyKey = 'easy';