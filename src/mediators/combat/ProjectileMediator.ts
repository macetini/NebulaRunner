// src/mediators/combat/ProjectileMediator.ts
import * as PIXI from 'pixi.js';
import type { IContextItem } from "../../core/context/meta/IContextItem";
import type { GameConfig } from "../../core/game/GameConfig";
import { GameSignals } from "../../core/game/GameSignals";
import type { SignalBus } from "../../core/game/SignalBus";
import type { HitboxPool } from "../../pools/HitboxPool";
import type { ProjectileEmission } from "../../projectiles/ProjectileEmission";
import { TrajectoryRegistry } from '../../projectiles/trajectories/TrajectoryRegistry';
import type { ProjectileState } from "../../projectiles/type/ProjectileState";
import type { HitboxSprite } from "../../views/combat/HitboxSprite";
import type { PlayerView } from "../../views/gameplay/PlayerView";

export class ProjectileMediator implements IContextItem {
    private readonly hitBoxPool: HitboxPool;
    private readonly signalBus: SignalBus;
    private readonly config: GameConfig;
    private readonly screenHeight: number;
    private readonly debugContainer?: PIXI.Container;
    private readonly playerView: PlayerView;

    private readonly isDebugActive: boolean;

    private activeBeam?: HitboxSprite;

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

        if (emission.data.projectile.behavior === "beam") {
            this.handleBeamEmission(emission);
        } else {
            this.handleStandardEmission(emission);
        }
    };

    private handleStandardEmission(emission: ProjectileEmission): void {
        this.clearActiveBeam();

        const proj = emission.data.projectile;
        const state = this.createProjectileState(
            emission,
            emission.x,
            this.playerView.muzzleY,
            proj.width,
            proj.height ?? 1,
        );

        const hitbox = this.hitBoxPool.pool(state);
        this.attachDebugHitbox(hitbox);
    }

    private handleBeamEmission(emission: ProjectileEmission): void {
        const beamHeight = this.computeBeamHeight();
        const proj = emission.data.projectile;

        const state = this.createProjectileState(
            emission,
            emission.x,
            beamHeight / 2,
            proj.width,
            beamHeight,
        );

        if (this.activeBeam) {
            this.activeBeam.configure(state, this.config.showWeaponHitboxes);
            this.activeBeam.position.set(state.x, beamHeight / 2);
            this.activeBeam.height = beamHeight;
            return;
        }

        this.createNewBeam(state);
    }

    private createProjectileState(
        emission: ProjectileEmission,
        x: number,
        y: number,
        width: number,
        height: number,
    ): ProjectileState {
        const proj = emission.data.projectile;

        return {
            x,
            y,
            width,
            height,
            vx: proj.vx ?? 0,
            vy: proj.vy ?? 0,
            damage: emission.data.damage,
            isPiercing: emission.data.piercing,
            owner: proj.owner,
            behavior: proj.behavior,
        };
    }

    private computeBeamHeight(): number {
        return Math.max(1, this.playerView.muzzleY);
    }

    private createNewBeam(state: ProjectileState): HitboxSprite {
        const beam = this.hitBoxPool.pool(state);
        this.activeBeam = beam;

        this.attachDebugHitbox(beam);
        return beam;
    }

    private clearActiveBeam(): void {
        if (!this.activeBeam) return;

        const index = this.hitBoxPool.activeHitboxes.indexOf(this.activeBeam);
        if (index >= 0) {
            this.hitBoxPool.recycle(this.activeBeam, index);
        }
        this.activeBeam = undefined;
    }

    private readonly onWeaponChanged = (): void => {
        this.clearActiveBeam();
    };

    private readonly onRunRestarted = (): void => {
        this.clearActiveBeam();
    };

    // -----------------------------
    // Enemy Firing
    // -----------------------------
    private onEnemyFired = (_e: Event): void => { };

    // -----------------------------
    // Update Loop & Boundary Logic
    // -----------------------------
    public update(delta: number): void {
        this.updateActiveBeamPosition();
        this.updateProjectileLifecycle(delta);
    }

    private updateActiveBeamPosition(): void {
        if (!this.activeBeam) return;

        const beamHeight = this.computeBeamHeight();
        this.activeBeam.position.set(this.playerView.x, beamHeight / 2);
        this.activeBeam.height = beamHeight;
    }

    private updateProjectileLifecycle(delta: number): void {
        const hitboxes = this.hitBoxPool.activeHitboxes;

        for (let i = hitboxes.length - 1; i >= 0; i--) {
            const hitbox = hitboxes[i];

            this.syncDebugOverlay(hitbox);

            if (hitbox.isBeam) continue;

            // 1. Move projectile based on behavior
            this.updateProjectilePosition(hitbox, delta);

            // 2. Centralized out-of-bounds recycling
            if (this.isOutOfBounds(hitbox)) {
                this.hitBoxPool.recycle(hitbox, i);
                continue;
            }

            // 3. Keep internal collision state synchronized
            if (hitbox.state) {
                hitbox.state.x = hitbox.x;
                hitbox.state.y = hitbox.y;
            }
        }
    }

    private isOutOfBounds(hitbox: HitboxSprite): boolean {
        const padding = hitbox.height / 2;

        if (hitbox.isEnemy) {
            return hitbox.y > this.screenHeight + padding;
        }

        return hitbox.y < -padding;
    }

    private updateProjectilePosition(hitbox: HitboxSprite, delta: number): void {
        if (!hitbox.state) return;

        const strategy = TrajectoryRegistry.getStrategy(hitbox.state.behavior);
        const nextPos = strategy.calculateNextPosition(
            {
                x: hitbox.x,
                y: hitbox.y,
                vx: hitbox.state.vx,
                vy: hitbox.state.vy,
            },
            delta
        );

        hitbox.x = nextPos.x;
        hitbox.y = nextPos.y;
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
