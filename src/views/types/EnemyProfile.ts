import type { EnemyType } from './EnemyType';

export type EnemyMovementType = 'straight' | 'sine' | 'chase' | 'sineChain' | 'looping';

export type EnemyProfile = {
    type: EnemyType;
    movement: EnemyMovementType;
    color: number;
    speedMultiplier: number;
    health: number;
    score: number;
};
