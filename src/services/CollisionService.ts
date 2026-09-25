import type { BuffSystem } from '../buffs/BuffSystem';
import { BuffType } from '../buffs/BuffType';
import type { IContextItem } from "../core/context/meta/IContextItem";
import type { GameConfig } from '../core/game/GameConfig';
import { GameSignals } from "../core/game/GameSignals";
import type { SignalBus } from "../core/game/SignalBus";
import type { BuffPool } from '../pools/BuffPool';
import type { EnemyPool } from "../pools/EnemyPool";
import type { HitboxPool } from "../pools/HitboxPool";
import type { WeaponPool } from '../pools/WeaponPickupPool';
import type { HitboxSprite } from '../views/combat/HitboxSprite';
import { EnemyType } from '../views/combat/types/EnemyType';
import type { EnemyView } from '../views/gameplay/EnemyView';
import type { PlayerView } from '../views/gameplay/PlayerView';

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
        const activeProjectiles = this.projectilePool.getActive;
        const enemies = this.enemyPool.activeEnemies;

        this.checkBulletWithEnemyCollision(activeProjectiles, enemies);
        this.checkPlayerWithBuffDropCollision();
        this.checkPlayerWithWeaponDropCollision();

        const isGodMode = this.config.godMode;

        if (!isGodMode || this.player.boostActive) {
            this.checkEnemyWithPlayerCollision(enemies);
        }
        if (!isGodMode) {
            this.checkEnemyBulletWithPlayerCollision(activeProjectiles);
        }
    }

    // -----------------------------
    // Player Collisions
    // -----------------------------
    private checkEnemyBulletWithPlayerCollision(bullets: HitboxSprite[]): void {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.isEnemy) continue;

            if (!this.overlapsPlayer(bullet.x, bullet.y, bullet.width, bullet.height)) continue;

            this.projectilePool.recycle(bullet, i);
            if (this.player.boostActive) continue;

            this.resolvePlayerHit();
            return;
        }
    }

    private checkPlayerWithBuffDropCollision(): void {
        const buffs = this.buffPool.activeBuffs;
        for (let i = buffs.length - 1; i >= 0; i--) {
            const buff = buffs[i];
            if (!this.overlapsPlayer(buff.x, buff.y, buff.width, buff.height)) continue;

            this.buffPool.recycle(buff, i);
            this.signalBus.dispatch(GameSignals.BUFF_COLLECTED, { type: buff.type });

            if (buff.type === BuffType.EXPLOSION) {
                this.triggerExplosion(buff.x, buff.y);
            }
        }
    }

    private checkPlayerWithWeaponDropCollision(): void {
        const weaponDrops = this.weaponPool.activeWeaponPickups;
        for (let i = weaponDrops.length - 1; i >= 0; i--) {
            const weaponDrop = weaponDrops[i];
            if (!this.overlapsPlayer(weaponDrop.x, weaponDrop.y, weaponDrop.width, weaponDrop.height)) continue;

            this.weaponPool.recycle(weaponDrop, i);
            this.signalBus.dispatch(GameSignals.WEAPON_PICKED_UP, { weaponId: weaponDrop.weaponId });
        }
    }

    private checkEnemyWithPlayerCollision(enemies: EnemyView[]): void {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.type === EnemyType.STATIC_BOX) continue;

            if (!this.overlapsPlayer(enemy.x, enemy.y, enemy.width, enemy.height)) continue;

            if (this.player.boostActive) {
                this.killEnemy(enemy, i);
                continue;
            }

            this.enemyPool.recycle(enemy, i);
            this.resolvePlayerHit();
            return;
        }
    }

    // -----------------------------
    // Enemy Collisions
    // -----------------------------
    private checkBulletWithEnemyCollision(projectiles: HitboxSprite[], enemies: EnemyView[]): void {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const bullet = projectiles[i];
            if (bullet.isEnemy) continue;

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];

                if (!this.checkCollision(
                    bullet.x, bullet.y, bullet.width, bullet.height,
                    enemy.x, enemy.y, enemy.width, enemy.height,
                )) {
                    continue;
                }

                const enemyDefeated = enemy.takeHit(bullet.damage);
                this.dispatchEnemyDied(enemy, enemyDefeated);

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

    // -----------------------------
    // Shared Helpers
    // -----------------------------
    private triggerExplosion(x: number, y: number): void {
        const enemies = this.enemyPool.activeEnemies;
        for (let i = enemies.length - 1; i >= 0; i--) {
            this.killEnemy(enemies[i], i);
        }
        this.signalBus.dispatch(GameSignals.EXPLOSION_TRIGGERED, { x, y });
    }

    private killEnemy(enemy: EnemyView, index: number): void {
        this.dispatchEnemyDied(enemy, true);
        this.enemyPool.recycle(enemy, index);
    }

    private dispatchEnemyDied(enemy: EnemyView, defeated: boolean): void {
        this.signalBus.dispatch(GameSignals.ENEMY_DIED, {
            x: enemy.x,
            y: enemy.y,
            defeated,
            score: enemy.score,
            color: enemy.color,
        });
    }

    private resolvePlayerHit(): void {
        if (this.buffSystem.consumeShield()) {
            this.player.triggerShieldHit();
            return;
        }

        this.signalBus.dispatch(GameSignals.PLAYER_DIED, {
            x: this.player.x,
            y: this.player.y,
        });
    }

    private overlapsPlayer(x: number, y: number, width: number, height: number): boolean {
        return this.checkCollision(
            this.player.x, this.player.y, this.player.width, this.player.height,
            x, y, width, height,
        );
    }

    private checkCollision(
        ax: number, ay: number, aw: number, ah: number,
        bx: number, by: number, bw: number, bh: number,
    ): boolean {
        return (
            Math.abs(ax - bx) < (aw + bw) / 2 &&
            Math.abs(ay - by) < (ah + bh) / 2
        );
    }
}
