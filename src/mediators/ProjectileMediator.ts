import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import { SignalBus } from "../core/SignalBus";
import type { ProjectilePool } from "../pools/ProjectilePool";

export class ProjectileMediator implements IContextItem {
    private readonly pool: ProjectilePool;
    private readonly signalBus: SignalBus;
    private readonly config: GameConfig;
    private readonly screenHeight: number;

    constructor(pool: ProjectilePool, signalBus: SignalBus, config: GameConfig, screenHeight: number) {
        this.pool = pool;
        this.signalBus = signalBus;
        this.config = config;
        this.screenHeight = screenHeight;

        this.signalBus.addEventListener(GameSignals.PLAYER_FIRED, (e: Event) => {
            const customEvent = e as CustomEvent;
            const { x, y } = customEvent.detail;
            this.pool.spawn(x, y - 25, false);
        });

        this.signalBus.addEventListener(GameSignals.ENEMY_FIRED, (e: Event) => {
            const customEvent = e as CustomEvent;
            const { x, y } = customEvent.detail;
            this.pool.spawn(x, y + 25, true);
        });
    }

    public update(delta: number): void {
        const bullets = this.pool.activeBullets;
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (bullet.isEnemy) {
                bullet.y += this.config.enemyProjectileSpeed * delta;
                if (bullet.y > this.screenHeight + bullet.height) {
                    this.pool.recycle(bullet, i);
                }
            } else {
                bullet.y -= this.config.projectileSpeed * delta;
                if (bullet.y < -bullet.height) {
                    this.pool.recycle(bullet, i);
                }
            }
        }
    }
}
