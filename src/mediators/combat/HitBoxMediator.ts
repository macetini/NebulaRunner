import type { GameConfig } from "../../core/GameConfig";
import { GameSignals } from "../../core/GameSignals";
import type { IContextItem } from "../../core/meta/IContextItem";
import type { SignalBus } from "../../core/SignalBus";
import type { HitboxPool } from "../../pools/HitboxPool";

export class HitBoxMediator implements IContextItem {
    private readonly pool: HitboxPool;
    private readonly signalBus: SignalBus;
    private readonly config: GameConfig;
    private readonly screenHeight: number;

    constructor(
        pool: HitboxPool,
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
        const hitboxes = this.pool.activeHitboxes;
        const enemySpeedStep = this.config.enemyProjectileSpeed * delta;
        const playerSpeedStep = this.config.projectileSpeed * delta;
        const lowerBound = this.screenHeight;

        for (let i = hitboxes.length - 1; i >= 0; i--) {
            const hitbox = hitboxes[i];

            // Skip position movement for frame-bound shader hitboxes (lasers, beams, AoE)
            if (hitbox.isFrameBound) {
                continue;
            }

            if (hitbox.isEnemy) {
                hitbox.y += enemySpeedStep;
                if (hitbox.y > lowerBound + hitbox.height) {
                    this.pool.recycle(hitbox, i);
                }
            } else {
                hitbox.y -= playerSpeedStep;
                if (hitbox.y < -hitbox.height) {
                    this.pool.recycle(hitbox, i);
                }
            }
        }

        // Purge instant frame-bound shader hitboxes
        this.pool.recycleFrameBoundHitboxes();
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.ENEMY_FIRED, this.onEnemyFired);
    }
}
