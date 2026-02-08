import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import type { SignalBus } from "../core/SignalBus";
import type { EnemyPool } from "../pools/EnemyPool";
import type { ProjectilePool } from "../pools/ProjectilePool";

export class CollisionService implements IContextItem {
    private readonly COLLISION_DISTANCE: number = 25;

    private readonly projectilePool: ProjectilePool;
    private readonly enemyPool: EnemyPool;
    private readonly signalBus: SignalBus;

    constructor(
        projectilePool: ProjectilePool,
        enemyPool: EnemyPool,
        signalBus: SignalBus
    ) {
        this.projectilePool = projectilePool;
        this.enemyPool = enemyPool;
        this.signalBus = signalBus;
    }

    public update(delta: number): void {
        const bullets = this.projectilePool.activeBullets;
        const enemies = this.enemyPool.activeEnemies;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];

                if (this.checkCollision(bullet.x, bullet.y, enemy.x,    enemy.y)) {
                    this.signalBus.dispatch(GameSignals.ENEMY_DIED, {
                        x: enemy.x,
                        y: enemy.y
                    });

                    this.projectilePool.recycle(bullet, i);
                    this.enemyPool.recycle(enemy, j);

                    break;
                }
            }
        }
    }

    /**
     * Simple Pythagorean distance check: a² + b² = c²
     */
    private checkCollision(x1: number, y1: number, x2: number, y2: number): boolean {
        const dx = x1 - x2;
        const dy = y1 - y2;
        // Optimization: Compare squared distance to avoid Math.sqrt()
        return (dx * dx + dy * dy) < (this.COLLISION_DISTANCE * this.COLLISION_DISTANCE);
    }
}