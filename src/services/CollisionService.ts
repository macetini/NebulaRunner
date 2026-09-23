import type { BuffSystem } from '../buffs/BuffSystem';
import { BuffType } from '../buffs/BuffType';
import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import type { SignalBus } from "../core/SignalBus";
import type { BuffPool } from '../pools/BuffPool';
import type { EnemyPool } from "../pools/EnemyPool";
import type { HitboxPool } from "../pools/HitboxPool";
import type { WeaponPool } from '../pools/WeaponPickupPool';
import type { HitboxView } from '../views/combat/HitboxView';
import { EnemyType } from '../views/combat/types/EnemyType';
import type { EnemyView } from '../views/gameplay/EnemyView';
import type { PlayerView } from '../views/gameplay/PlayerView';

/**
 *
 * Collision service, checks if the player is hit by an enemy or
 * if a bullet hits an enemy.
 *
 */
export class CollisionService implements IContextItem {
    private readonly signalBus: SignalBus;
    private readonly config: GameConfig;

    private readonly player: PlayerView;

    private readonly projectilePool: HitboxPool;
    private readonly buffPool: BuffPool;
    private readonly weaponPool: WeaponPool;
    private readonly enemyPool: EnemyPool;

    private readonly buffSystem: BuffSystem;

    constructor(
        signalBus: SignalBus,
        config: GameConfig,
        player: PlayerView,
        projectilePool: HitboxPool,
        enemyPool: EnemyPool,
        weaponPool: WeaponPool,
        buffPool: BuffPool,
        buffManager: BuffSystem,
    ) {
        this.signalBus = signalBus;
        this.config = config;

        this.player = player;

        this.projectilePool = projectilePool;
        this.enemyPool = enemyPool;
        this.buffPool = buffPool;
        this.weaponPool = weaponPool;

        this.buffSystem = buffManager;
    }

    public update(): void {
        const bullets = this.projectilePool.activeBullets;
        const enemies = this.enemyPool.activeEnemies;

        this.checkBulletWithEnemyCollision(bullets, enemies);
        this.checkPlayerWithBuffDropCollision();
        this.checkPlayerWithWeaponDropCollision();

        if (this.config.godMode === false || this.player.boostActive) {
            this.checkEnemyWithPlayerCollision(this.player, enemies);
        }
        if (this.config.godMode === false) {
            this.checkEnemyBulletWithPlayerCollision(bullets, this.player);
        }
    }

    private checkEnemyBulletWithPlayerCollision(bullets: HitboxView[], player: PlayerView): void {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (bullet.isEnemy) {
                if (this.checkCollision(bullet.x, bullet.y, player.x, player.y)) {
                    this.projectilePool.recycle(bullet, i);
                    if (player.boostActive) {
                        continue;
                    }
                    if (this.buffSystem.consumeShield()) {
                        this.player.triggerShieldHit();
                        return;
                    }
                    this.signalBus.dispatch(GameSignals.PLAYER_DIED, {
                        x: player.x,
                        y: player.y,
                    });
                    break;
                }
            }
        }
    }

    private checkPlayerWithBuffDropCollision(): void {
        const buffs = this.buffPool.activeBuffs;
        for (let index = buffs.length - 1; index >= 0; index -= 1) {
            const buff = buffs[index];
            if (this.checkCollision(this.player.x, this.player.y, buff.x, buff.y)) {
                this.buffPool.recycle(buff, index);
                this.signalBus.dispatch(GameSignals.BUFF_COLLECTED, { type: buff.type });
                if (buff.type === BuffType.EXPLOSION) {
                    this.triggerExplosion(buff.x, buff.y);
                }
            }
        }
    }

    private checkPlayerWithWeaponDropCollision(): void {
        const weaponDrops = this.weaponPool.activeWeaponPickups;
        for (let index = weaponDrops.length - 1; index >= 0; index -= 1) {
            const weaponDrop = weaponDrops[index];

            if (this.checkCollision(this.player.x, this.player.y, weaponDrop.x, weaponDrop.y)) {
                this.weaponPool.recycle(weaponDrop, index);
                this.signalBus.dispatch(GameSignals.WEAPON_PICKED_UP, { weaponId: weaponDrop.weaponId });
            }
        }
    }


    private triggerExplosion(x: number, y: number): void {
        const enemies = this.enemyPool.activeEnemies;
        for (let index = enemies.length - 1; index >= 0; index -= 1) {
            const enemy = enemies[index];
            this.signalBus.dispatch(GameSignals.ENEMY_DIED, {
                x: enemy.x,
                y: enemy.y,
                defeated: true,
                score: enemy.score,
                color: enemy.color,
            });
            this.enemyPool.recycle(enemy, index);
        }

        this.signalBus.dispatch(GameSignals.EXPLOSION_TRIGGERED, { x, y });
    }

    /**
     *
     * Checks if a bullet hits an enemy
     *
     * @param bullets
     * @param enemies
     */
    private checkBulletWithEnemyCollision(bullets: HitboxView[], enemies: EnemyView[]): void {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (bullet.isEnemy) {
                continue; // Enemy bullets do not damage other enemies
            }

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];

                if (this.checkCollision(bullet.x, bullet.y, enemy.x, enemy.y)) {
                    const enemyDefeated = enemy.takeHit(bullet.damage);
                    this.signalBus.dispatch(GameSignals.ENEMY_DIED, {
                        x: enemy.x,
                        y: enemy.y,
                        defeated: enemyDefeated,
                        score: enemy.score,
                        color: enemy.color,
                    });

                    if (!bullet.isPiercing) {
                        this.projectilePool.recycle(bullet, i);
                    }
                    if (enemyDefeated) {
                        this.enemyPool.recycle(enemy, j);
                    }

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
    private checkEnemyWithPlayerCollision(player: PlayerView, enemies: EnemyView[]): void {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.type === EnemyType.STATIC_BOX) {
                continue;
            }
            if (this.checkCollision(player.x, player.y, enemy.x, enemy.y)) {
                if (player.boostActive) {
                    this.signalBus.dispatch(GameSignals.ENEMY_DIED, {
                        x: enemy.x,
                        y: enemy.y,
                        defeated: true,
                        score: enemy.score,
                        color: enemy.color,
                    });
                    this.enemyPool.recycle(enemy, i);
                    continue;
                }
                this.enemyPool.recycle(enemy, i);
                if (this.buffSystem.consumeShield()) {
                    this.player.triggerShieldHit();
                    return;
                }
                this.signalBus.dispatch(GameSignals.PLAYER_DIED, {
                    x: player.x,
                    y: player.y,
                });
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
        return (dx * dx + dy * dy) < (this.config.collisionDistance * this.config.collisionDistance);
    }
}
