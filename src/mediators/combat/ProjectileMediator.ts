import * as PIXI from 'pixi.js';
import type { IContextItem } from "../../core/context/meta/IContextItem";
import type { GameConfig } from "../../core/game/GameConfig";
import { GameSignals } from "../../core/game/GameSignals";
import type { SignalBus } from "../../core/game/SignalBus";
import type { HitboxPool } from "../../pools/HitboxPool";
import type { ProjectileEmission } from "../../projectiles/ProjectileEmission";
import type { HitboxSprite } from '../../views/combat/HitboxSprite';
import type { PlayerView } from '../../views/gameplay/PlayerView';

export class ProjectileMediator implements IContextItem {
    private readonly hitBoxPool: HitboxPool;
    private readonly signalBus: SignalBus;
    private readonly config: GameConfig;
    private readonly screenHeight: number;
    private readonly debugContainer?: PIXI.Container;
    private readonly playerView: PlayerView;
    private activeBeam?: HitboxSprite;

    private readonly isDebugActive: boolean;

    constructor(
        pool: HitboxPool,
        signalBus: SignalBus,
        config: GameConfig,
        screenHeight: number,
        playerView: PlayerView,
        debugContainer: PIXI.Container | undefined,
    ) {
        this.hitBoxPool = pool;
        this.signalBus = signalBus;
        this.config = config;
        this.screenHeight = screenHeight;
        this.debugContainer = debugContainer;
        this.playerView = playerView;

        this.isDebugActive = config.showWeaponHitboxes && !!debugContainer;

        this.registerSignalListeners();
    }

    // -----------------------------
    // Signal Management & Lifecycle
    // -----------------------------
    private registerSignalListeners(): void {
        this.signalBus.addEventListener(GameSignals.ENEMY_FIRED, this.onEnemyFired);
        this.signalBus.addEventListener(GameSignals.PLAYER_FIRED, this.onPlayerFired);
        this.signalBus.addEventListener(GameSignals.WEAPON_PICKED_UP, this.onWeaponChanged);
        this.signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.ENEMY_FIRED, this.onEnemyFired);
        this.signalBus.removeEventListener(GameSignals.PLAYER_FIRED, this.onPlayerFired);
        this.signalBus.removeEventListener(GameSignals.WEAPON_PICKED_UP, this.onWeaponChanged);
        this.signalBus.removeEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
    }

    // -----------------------------
    // Player Firing
    // -----------------------------
    private onPlayerFired = (e: Event): void => {
        const emission = (e as CustomEvent<{ emission: ProjectileEmission }>).detail.emission;

        if (emission.options.behavior === "beam") {
            this.handleBeamEmission(emission);
        } else {
            this.handleStandardEmission(emission);
        }
    };

    private handleStandardEmission(emission: ProjectileEmission): void {
        this.clearActiveBeams();
        const hitbox = this.hitBoxPool.pool(emission);
        this.attachDebugHitbox(hitbox);
    }

    // -----------------------------
    // Beam Handling
    // -----------------------------
    private handleBeamEmission(emission: ProjectileEmission): void {
        const beamHeight = Math.max(1, emission.y - 35);

        if (this.activeBeam) {
            this.updateActiveBeam(emission, beamHeight);
            return;
        }

        this.createNewBeam(emission, beamHeight);
    }

    private updateActiveBeam(emission: ProjectileEmission, beamHeight: number): void {
        this.activeBeam!.configure(
            { ...emission.options, height: beamHeight },
            this.config.showWeaponHitboxes
        );
        this.activeBeam!.position.set(emission.x, beamHeight / 2);
    }

    private createNewBeam(emission: ProjectileEmission, beamHeight: number): void {
        this.activeBeam = this.hitBoxPool.pool({
            x: emission.x,
            y: beamHeight / 2,
            options: { ...emission.options, height: beamHeight }
        });

        this.attachDebugHitbox(this.activeBeam);
    }

    private clearActiveBeams(): void {
        if (!this.activeBeam) {
            return;
        }

        const index = this.hitBoxPool.activeHitboxes.indexOf(this.activeBeam);
        if (index >= 0) {
            this.hitBoxPool.recycle(this.activeBeam, index);
        }
        this.activeBeam = undefined;
    }

    private readonly onWeaponChanged = (): void => {
        this.clearActiveBeams();
    };

    private readonly onRunRestarted = (): void => {
        this.activeBeam = undefined;
    };

    // -----------------------------
    // Enemy Firing
    // -----------------------------
    private onEnemyFired = (_e: Event): void => { };

    // -----------------------------
    // Update Loop
    // -----------------------------
    public update(delta: number): void {
        this.updateActiveBeamPosition();
        this.updateHitboxes(delta);
    }

    private updateActiveBeamPosition(): void {
        if (!this.activeBeam) return;

        const beamHeight = Math.max(1, this.playerView.y - 35);
        this.activeBeam.position.set(this.playerView.x, beamHeight / 2);
        this.activeBeam.height = beamHeight;
    }

    private updateHitboxes(delta: number): void {
        const hitboxes = this.hitBoxPool.activeHitboxes;
        const enemyStep = this.config.enemyProjectileSpeed * delta;
        const playerStep = this.config.projectileSpeed * delta;
        const lowerBound = this.screenHeight;

        for (let i = hitboxes.length - 1; i >= 0; i--) {
            const hitbox = hitboxes[i];

            this.syncDebugOverlay(hitbox);

            if (hitbox.isBeam) continue;

            if (hitbox.isEnemy) {
                this.updateEnemyHitbox(hitbox, enemyStep, lowerBound, i);
            } else {
                this.updatePlayerHitbox(hitbox, playerStep, i);
            }
        }
    }

    private updateEnemyHitbox(hitbox: HitboxSprite, step: number, lowerBound: number, index: number): void {
        hitbox.y += step;
        if (hitbox.y > lowerBound + hitbox.height) {
            this.hitBoxPool.recycle(hitbox, index);
        }
    }

    private updatePlayerHitbox(hitbox: HitboxSprite, step: number, index: number): void {
        hitbox.y -= step;
        if (hitbox.y < -hitbox.height) {
            this.hitBoxPool.recycle(hitbox, index);
        }
    }

    // -----------------------------
    // Debug Helpers
    // -----------------------------
    private syncDebugOverlay(hitbox: HitboxSprite): void {
        if (this.isDebugActive && !hitbox.parent) {
            this.debugContainer!.addChild(hitbox);
        }
    }

    private attachDebugHitbox(hitbox: HitboxSprite): void {
        if (this.isDebugActive) {
            this.debugContainer!.addChild(hitbox);
        }
    }
}
