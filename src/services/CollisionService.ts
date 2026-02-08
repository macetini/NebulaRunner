import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import type { SignalBus } from "../core/SignalBus";
import type { EnemyPool } from "../pools/EnemyPool";
import type { ProjectilePool } from "../pools/ProjectilePool";
import type { BulletView } from "../views/BulletView";
import type { EnemyView } from "../views/EnemyView";
import type { PlayerView } from "../views/PlayerView";

/**
 * 
 * Collision service, checks if the player is hit by an enemy or 
 * if a bullet hits an enemy.
 * 
 */
export class CollisionService implements IContextItem {
    private readonly COLLISION_DISTANCE: number = 25;

    private readonly player: PlayerView;
    private readonly projectilePool: ProjectilePool;
    private readonly enemyPool: EnemyPool;
    private readonly signalBus: SignalBus;

    constructor(
        player: PlayerView,
        projectilePool: ProjectilePool,
        enemyPool: EnemyPool,
        signalBus: SignalBus
    ) {
        this.player = player;
        this.projectilePool = projectilePool;
        this.enemyPool = enemyPool;
        this.signalBus = signalBus;
    }

    public update(): void {
        const bullets = this.projectilePool.activeBullets;
        const enemies = this.enemyPool.activeEnemies;
        this.checkBulletWithEnemyCollision(bullets, enemies);
        this.checkBulletWithPlayerCollision(this.player, enemies);

    }

    /**
     * 
     * Checks if a bullet hits an enemy
     * 
     * @param bullets 
     * @param enemies 
     */
    private checkBulletWithEnemyCollision(bullets: BulletView[], enemies: EnemyView[]): void {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];

                if (this.checkCollision(bullet.x, bullet.y, enemy.x, enemy.y)) {
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
     * 
     * Checks if the player is hit by an enemy
     * 
     * @param player 
     * @param enemies 
     */
    checkBulletWithPlayerCollision(player: PlayerView, enemies: EnemyView[]): void {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (this.checkCollision(player.x, player.y, enemy.x, enemy.y)) {
                this.enemyPool.recycle(enemy, i);
                this.signalBus.dispatch(GameSignals.PLAYER_DIED, {});
                break;
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