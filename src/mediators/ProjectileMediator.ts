import type { GameConfig } from "../core/GameConfig";
import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import { SignalBus } from "../core/SignalBus";
import type { ProjectilePool } from "../pools/ProjectilePool";

export class ProjectileMediator implements IContextItem {
    private readonly pool: ProjectilePool;
    private readonly signalBus: SignalBus;
    private readonly config: GameConfig;
    private readonly screenHeight: number;

    constructor(
        pool: ProjectilePool,
        signalBus: SignalBus,
        config: GameConfig,
        screenHeight: number
    ) {
        this.pool = pool;
        this.signalBus = signalBus;
        this.config = config;
        this.screenHeight = screenHeight;

        this.signalBus.addEventListener(GameSignals.ENEMY_FIRED, this.onEnemyFired);
    }

    private onEnemyFired = (e: Event): void => {
        const customEvent = e as CustomEvent<{ x: number; y: number }>;
        const { x, y } = customEvent.detail;
        this.pool.spawn(x, y + 25, true);
    };

    public update(delta: number): void {
        const bullets = this.pool.activeBullets;
        const enemySpeedStep = this.config.enemyProjectileSpeed * delta;
        const playerSpeedStep = this.config.projectileSpeed * delta;
        const lowerBound = this.screenHeight;

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];

            if (bullet.isEnemy) {
                bullet.y += enemySpeedStep;
                if (bullet.y > lowerBound + bullet.height) {
                    this.pool.recycle(bullet, i);
                }
            } else {
                bullet.y -= playerSpeedStep;
                if (bullet.y < -bullet.height) {
                    this.pool.recycle(bullet, i);
                }
            }
        }
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.ENEMY_FIRED, this.onEnemyFired);
    }
}
