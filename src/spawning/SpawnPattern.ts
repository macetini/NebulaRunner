import type { EnemyPool } from '../pools/EnemyPool';
import type { EnemyProfile } from '../views/types/EnemyProfile';
import type { GameConfig } from '../core/GameConfig';

export interface QueuedEnemy {
    x: number;
    y: number;
    profile: EnemyProfile;
    delay: number;
}

export interface SpawnPattern {
    /**
     * Calculates the horizontal starting coordinate (x) for this enemy.
     */
    calculateSpawnX(screenWidth: number, config: GameConfig): number;

    /**
     * Spawns the head and handles queuing any trailing segments if needed.
     */
    spawn(
        x: number,
        y: number,
        profile: EnemyProfile,
        pool: EnemyPool,
        spawnQueue: QueuedEnemy[]
    ): void;
}
