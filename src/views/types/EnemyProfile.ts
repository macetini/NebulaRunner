import type { EnemyType } from './EnemyType';

export type EnemyMovement = 'straight' | 'sine' | 'chase';

export type EnemyProfile = {
    type: EnemyType;
    movement: EnemyMovement;
    color: number;
    speedMultiplier: number;
    health: number;
    score: number;
};
