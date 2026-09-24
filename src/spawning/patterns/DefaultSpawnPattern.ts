import type { GameConfig } from '../../core/game/GameConfig';
import type { EnemyPool } from '../../pools/EnemyPool';
import type { EnemyProfile } from '../../views/combat/types/EnemyProfile';
import type { QueuedEnemy, SpawnPattern } from '../SpawnPattern';

export class DefaultSpawnPattern implements SpawnPattern {
    public calculateSpawnX(screenWidth: number, _config: GameConfig): number {
        return Math.random() * screenWidth;
    }

    public spawn(
        x: number,
        y: number,
        profile: EnemyProfile,
        pool: EnemyPool,
        _spawnQueue: QueuedEnemy[]
    ): void {
        pool.spawn(x, y, profile);
    }
}
