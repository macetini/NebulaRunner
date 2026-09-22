import type { EnemyType } from './EnemyType';

export type EnemyMovementType = 'straight' | 'sine' | 'chase' | 'sineChain' | 'looping' | 'static';

export type EnemyProfile = {
    type: EnemyType;
    movement: EnemyMovementType;
    color: number;
    speedMultiplier: number;
    health: number;
    score: number;
    scale?: number;
};
