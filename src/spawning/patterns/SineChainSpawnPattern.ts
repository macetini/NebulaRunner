import type { GameConfig } from '../../core/game/GameConfig';
import type { EnemyPool } from '../../pools/EnemyPool';
import type { EnemyProfile } from '../../views/combat/types/EnemyProfile';
import type { QueuedEnemy, SpawnPattern } from '../SpawnPattern';

export class SineChainSpawnPattern implements SpawnPattern {
    public calculateSpawnX(screenWidth: number, config: GameConfig): number {
        const chainAmplitude = config.enemySineOscillationAmplitude * 4.5;
        const chainMargin = Math.min(chainAmplitude + 15, screenWidth * 0.5);
        const usableWidth = Math.max(0, screenWidth - chainMargin * 2);
        return chainMargin + Math.random() * usableWidth;
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

        // Queue the remaining segments to follow behind sequentially
        const chainLength = 6;
        const segmentDelay = 12; // frames between segment spawns
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
