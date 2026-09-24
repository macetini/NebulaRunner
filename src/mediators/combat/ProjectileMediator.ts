import * as PIXI from 'pixi.js';
import type { GameConfig } from "../../core/game/GameConfig";
import { GameSignals } from "../../core/game/GameSignals";
import type { IContextItem } from "../../core/context/meta/IContextItem";
import type { SignalBus } from "../../core/game/SignalBus";
import type { HitboxPool } from "../../pools/HitboxPool";
import type { ProjectileEmission } from "../../projectiles/ProjectileEmission";

export class ProjectileMediator implements IContextItem {
    private readonly pool: HitboxPool;
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
        this.pool = pool;
        this.signalBus = signalBus;
        this.config = config;
        this.screenHeight = screenHeight;
        this.debugContainer = debugContainer;

        this.signalBus.addEventListener(GameSignals.ENEMY_FIRED, this.onEnemyFired);
        this.signalBus.addEventListener(GameSignals.PLAYER_FIRED, this.onPlayerFired);
    }

    private onPlayerFired = (e: Event): void => {
        const { emissions } = (e as CustomEvent<{ emissions: ProjectileEmission[] }>).detail;
        for (const emission of emissions) {
            this.pool.pool(emission);
        }
    };

    private onEnemyFired = (e: Event): void => {
        const customEvent = e as CustomEvent<{ x: number; y: number }>;
        //const { x, y } = customEvent.detail;
        //this.pool.spawn(x, y + 25, true);
    };

    public update(delta: number): void {
        const hitboxes = this.pool.activeHitboxes;
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
        this.signalBus.removeEventListener(GameSignals.PLAYER_FIRED, this.onPlayerFired);
    }
}
