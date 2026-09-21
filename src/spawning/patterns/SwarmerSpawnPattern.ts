import type { GameConfig } from '../../core/GameConfig';
import type { EnemyPool } from '../../pools/EnemyPool';
import type { EnemyProfile } from '../../views/types/EnemyProfile';
import type { QueuedEnemy, SpawnPattern } from '../SpawnPattern';

export class SwarmerSpawnPattern implements SpawnPattern {
    public calculateSpawnX(screenWidth: number, _config: GameConfig): number {
        const swarmMargin = Math.min(50, screenWidth * 0.5);
        const usableWidth = Math.max(0, screenWidth - swarmMargin * 2);
        return swarmMargin + Math.random() * usableWidth;
    }

    public spawn(
        x: number,
        y: number,
        profile: EnemyProfile,
        pool: EnemyPool,
        spawnQueue: QueuedEnemy[]
    ): void {
        if (spawnQueue.some((queuedEnemy) => queuedEnemy.profile.type === profile.type)) {
            return;
        }

        // Spawn the head immediately
        pool.spawn(x, y, profile);

        // Queue up a dense swarm of 8 looping swarmers!
        const chainLength = 8;
        const segmentDelay = 10; // slightly denser delay to keep the swarm close-knit
        for (let i = 1; i < chainLength; i++) {
            spawnQueue.push({
                x,
                y,
                profile: { ...profile },
                delay: i * segmentDelay,
            });
        }
    }
}
