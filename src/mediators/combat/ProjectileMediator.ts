import * as PIXI from 'pixi.js';
import type { IContextItem } from "../../core/context/meta/IContextItem";
import type { GameConfig } from "../../core/game/GameConfig";
import { GameSignals } from "../../core/game/GameSignals";
import type { SignalBus } from "../../core/game/SignalBus";
import type { HitboxPool } from "../../pools/HitboxPool";
import type { ProjectileEmission } from "../../projectiles/ProjectileEmission";

export class ProjectileMediator implements IContextItem {
    private readonly hitBoxPool: HitboxPool;
    private readonly signalBus: SignalBus;
    private readonly config: GameConfig;

    private readonly screenHeight: number;
    private readonly debugContainer?: PIXI.Container;

    constructor(
        pool: HitboxPool,
        signalBus: SignalBus,
        config: GameConfig,
        screenHeight: number,
        debugContainer?: PIXI.Container
    ) {
        this.hitBoxPool = pool;
        this.signalBus = signalBus;
        this.config = config;
        this.screenHeight = screenHeight;
        this.debugContainer = debugContainer;

        this.signalBus.addEventListener(GameSignals.ENEMY_FIRED, this.onEnemyFired);
        this.signalBus.addEventListener(GameSignals.PLAYER_FIRED, this.onPlayerFired);
    }

    private onPlayerFired = (e: Event): void => {
        const emission = (e as CustomEvent<{ emission: ProjectileEmission }>).detail.emission;
        this.hitBoxPool.pool(emission);
    };

    private onEnemyFired = (_e: Event): void => {
    };

    public update(delta: number): void {
        const hitboxes = this.hitBoxPool.activeHitboxes;
        const enemySpeedStep = this.config.enemyProjectileSpeed * delta;
        const playerSpeedStep = this.config.projectileSpeed * delta;
        const lowerBound = this.screenHeight;

        const isDebugActive = this.config.showWeaponHitboxes && this.debugContainer !== undefined;

        for (let i = hitboxes.length - 1; i >= 0; i--) {
            const hitbox = hitboxes[i];

            // Debug Sync: Attach unparented active hitboxes to the debug overlay layer
            if (isDebugActive && !hitbox.parent) {
                this.debugContainer!.addChild(hitbox);
            }

            // Skip position movement for frame-bound shader hitboxes (lasers, beams, AoE)
            if (hitbox.isFrameBound) {
                continue;
            }

            if (hitbox.isEnemy) {
                hitbox.y += enemySpeedStep;
                if (hitbox.y > lowerBound + hitbox.height) {
                    this.hitBoxPool.recycle(hitbox, i);
                }
            } else {
                hitbox.y -= playerSpeedStep;
                if (hitbox.y < -hitbox.height) {
                    this.hitBoxPool.recycle(hitbox, i);
                }
            }
        }

        // Purge instant frame-bound shader hitboxes
        this.hitBoxPool.recycleFrameBoundHitboxes();
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.ENEMY_FIRED, this.onEnemyFired);
        this.signalBus.removeEventListener(GameSignals.PLAYER_FIRED, this.onPlayerFired);
    }
}
