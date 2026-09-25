import * as PIXI from 'pixi.js';
import type { IContextItem } from "../../core/context/meta/IContextItem";
import type { GameConfig } from "../../core/game/GameConfig";
import { GameSignals } from "../../core/game/GameSignals";
import type { SignalBus } from "../../core/game/SignalBus";
import type { HitboxPool } from "../../pools/HitboxPool";
import type { ProjectileEmission } from "../../projectiles/ProjectileEmission";
import type { ProjectileState } from '../../projectiles/type/ProjectileState';
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

        if (emission.data.projectile.behavior === "beam") {
            this.handleBeamEmission(emission);
            return;
        }

        this.handleStandardEmission(emission);

    };

    private handleStandardEmission(emission: ProjectileEmission): void {
        this.clearActiveBeams();

        // 💡 NEW LOGIC: Convert Emission event to runtime state before pooling
        const state = this.createProjectileState(emission);
        const hitbox = this.hitBoxPool.pool(state);

        this.attachDebugHitbox(hitbox);
    }

    private handleBeamEmission(emission: ProjectileEmission): void {
        const beamHeight = Math.max(1, emission.y - 35);

        // 💡 NEW LOGIC: Map directly to state with dynamic beam height
        const state = this.createProjectileState(emission, beamHeight);

        if (this.activeBeam) {
            this.updateActiveBeam(state, beamHeight);
            return;
        }

        this.createNewBeam(state);
    }

    private createProjectileState(emission: ProjectileEmission, overrideHeight?: number): ProjectileState {
        const proj = emission.data.projectile;
        return {
            x: emission.x,
            y: emission.y,
            width: proj.width,
            height: overrideHeight ?? proj.height ?? 1,
            vx: proj.vx ?? 0,
            vy: proj.vy ?? 0,
            damage: emission.data.damage,
            isPiercing: emission.data.piercing,
            owner: proj.owner,
            behavior: proj.behavior,
        };
    }

    private updateActiveBeam(state: ProjectileState, beamHeight: number): void {
        // 💡 NEW LOGIC: Configure using state instead of raw emission.data
        this.activeBeam!.configure(
            state,
            this.config.showWeaponHitboxes
        );
        this.activeBeam!.position.set(state.x, beamHeight / 2);
    }

    private createNewBeam(state: ProjectileState): HitboxSprite {
        // 💡 NEW LOGIC: No more nested spread overrides on emission.data!
        this.activeBeam = this.hitBoxPool.pool(state);
        this.attachDebugHitbox(this.activeBeam);
        return this.activeBeam;
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
