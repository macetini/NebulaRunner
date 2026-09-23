import * as PIXI from 'pixi.js';

import { BuffSystem } from '../buffs/BuffSystem';
import { BackgroundMediator } from '../mediators/BackgroundMediator';
import { BuffDropMediator } from '../mediators/BuffDropMediator';
import { CombatMediator } from '../mediators/CombatMediator';
import { EnemyMediator } from '../mediators/EnemyMediator';
import { ParticleMediator } from '../mediators/ParticleMediator';
import { PlasmaBeamWeaponMediator } from '../mediators/PlasmaBeamWeaponMediator';
import { PlayerMediator } from '../mediators/PlayerMediator';
import { ProjectileMediator } from '../mediators/ProjectileMediator';
import { ScoreMediator } from '../mediators/ScoreMediator';
import { WeaponDropMediator } from '../mediators/WeaponDropMediator';
import { WeaponSystemMediator } from '../mediators/WeaponSystemMediator';
import { LocalStorageSaveStorage } from '../persistence/LocalStorageSaveStorage';
import { BuffPool } from '../pools/BuffPool';
import { EnemyPool } from '../pools/EnemyPool';
import { ParticlePool } from '../pools/ParticlePool';
import { ProjectilePool } from '../pools/ProjectilePool';
import { WeaponPool } from '../pools/WeaponPickupPool';
import { CollisionService } from '../services/CollisionService';
import { GameUi } from '../ui/GameUi';
import { BackgroundView } from '../views/BackgroundView';
import { PlasmaBeamView } from '../views/PlasmaBeamView';
import { PlayerView } from '../views/PlayerView';
import { WeaponSystem } from '../weapons/WeaponSystem';
import { gameConfig } from './GameConfig';
import { GameSignals } from './GameSignals';
import type { GameState } from './GameState';
import { InputController } from './InputController';
import type { IContextItem } from './meta/IContextItem';
import { SignalBus } from './SignalBus';

/**
 * Core game context that bootstraps systems, connects MVC mediators, and manages the main loop.
 */
export class GameContext {
    private readonly app: PIXI.Application;
    private readonly signalBus: SignalBus;
    private readonly gameUi = new GameUi(gameConfig.showPerformanceStats);
    private readonly updatables: IContextItem[] = [];

    private input!: InputController;
    private state: GameState = 'ready';

    // Core Pools & Systems
    private enemyPool!: EnemyPool;
    private buffPool!: BuffPool;
    private weaponPool!: WeaponPool;
    private projectilePool!: ProjectilePool;
    private buffSystem!: BuffSystem;
    private weaponSystem!: WeaponSystem;

    // Views
    private backgroundView!: BackgroundView;
    private playerView!: PlayerView;
    private plasmaBeamView!: PlasmaBeamView;

    // Passive Mediators requiring ticker updates outside updatables array
    private particleMediator!: ParticleMediator;
    private scoreMediator!: ScoreMediator;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.signalBus = new SignalBus();
    }

    /**
     * Bootstraps all game systems, stage views, and mediators.
     */
    public init(): void {
        this.input = new InputController(this.app.canvas, this.app.screen.width);

        this.initPoolsAndSystems();
        this.initViews();
        this.initMediators();
        this.initServices();
        this.initUiAndLifecycle();

        // High-performance ticker update loop
        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
    }

    // =========================================================================
    // Initialization Sub-methods
    // =========================================================================

    private initPoolsAndSystems(): void {
        this.projectilePool = new ProjectilePool(this.app);
        this.enemyPool = new EnemyPool(this.app, gameConfig);
        this.buffPool = new BuffPool(this.app);
        this.weaponPool = new WeaponPool(this.app);

        this.buffSystem = new BuffSystem(gameConfig, this.signalBus);
        this.weaponSystem = new WeaponSystem(this.projectilePool, this.signalBus);

        this.updatables.push(this.buffSystem);
    }

    private initViews(): void {
        this.backgroundView = new BackgroundView(this.app, gameConfig);
        this.playerView = new PlayerView(this.app, gameConfig);
        this.plasmaBeamView = new PlasmaBeamView(this.app);

        // Strict Z-Ordering on Scene Graph
        this.app.stage.addChild(this.backgroundView);
        this.app.stage.addChild(this.playerView);
        this.app.stage.addChild(this.plasmaBeamView);

        // Window resize binding
        this.app.renderer.on('resize', (w, h) => this.backgroundView.resize(w, h));
    }

    private initMediators(): void {
        // Player & Background
        this.updatables.push(
            new BackgroundMediator(this.backgroundView, () => this.playerView.movementSpeedMultiplierValue),
            new PlayerMediator(this.playerView, this.signalBus, this.input, this.buffSystem, this.weaponSystem),
            new EnemyMediator(this.app, this.enemyPool, gameConfig, this.playerView, this.signalBus),
        );

        // Weapon Mediators
        this.updatables.push(
            new WeaponSystemMediator(this.weaponSystem, this.signalBus),
            new PlasmaBeamWeaponMediator(this.plasmaBeamView, this.signalBus, this.playerView, this.weaponSystem),
            new WeaponDropMediator(this.weaponPool, gameConfig, this.signalBus, this.app.screen.height, this.playerView),
        );

        // Buffs & Combat Feedback
        this.updatables.push(
            new BuffDropMediator(this.buffPool, gameConfig, this.signalBus, this.app.screen.height, this.playerView),
            new ProjectileMediator(this.projectilePool, this.signalBus, gameConfig, this.app.screen.height),
            new CombatMediator(this.app.stage, this.signalBus),
        );

        // Particle System
        const particlePool = new ParticlePool(this.app, gameConfig);
        this.particleMediator = new ParticleMediator(particlePool, this.signalBus);

        // Score Mediator
        this.scoreMediator = new ScoreMediator(this.gameUi.score, this.signalBus, new LocalStorageSaveStorage());
    }

    private initServices(): void {
        const collisionService = new CollisionService(
            this.signalBus,
            gameConfig,
            this.playerView,
            this.projectilePool,
            this.enemyPool,
            this.weaponPool,
            this.buffPool,
            this.buffSystem,
        );
        this.updatables.push(collisionService);
    }

    private initUiAndLifecycle(): void {
        this.gameUi.state.showReady(this.app.screen.width, this.app.screen.height, this.scoreMediator.best);
        this.app.stage.addChild(this.gameUi);

        this.signalBus.addEventListener(GameSignals.PLAYER_DIED, () => {
            this.state = 'gameOver';
            this.gameUi.state.showGameOver(
                this.app.screen.width,
                this.app.screen.height,
                this.scoreMediator.current,
                this.scoreMediator.best,
            );
            this.app.stage.addChild(this.gameUi);
        });
    }

    // =========================================================================
    // Game Loop & Lifecycle
    // =========================================================================

    /**
     * Ticker update loop optimized for zero GC allocations.
     */
    public update(delta: number = 0): void {
        this.gameUi.updatePerformanceStats(this.app.ticker.FPS, delta, this.app.screen.width);
        this.gameUi.updateBoostCharge(this.playerView.boostChargeValue, this.playerView.boostMaximumCharge);
        this.gameUi.updateBuffStatus(
            this.buffSystem.rapidFireTimeRemaining,
            this.buffSystem.rapidFireDuration,
            this.buffSystem.shieldTimeRemaining,
            this.buffSystem.shieldDuration,
        );

        if (this.state !== 'playing') {
            this.particleMediator.update(delta);
            if (this.input.consumeStartRequest()) {
                this.startRun();
            }
            return;
        }

        // Fast index-based loop (No Iterator GC allocations)
        const count = this.updatables.length;
        for (let i = 0; i < count; i++) {
            this.updatables[i].update(delta);
        }

        this.particleMediator.update(delta);
        this.gameUi.score.updateDistance(this.backgroundView.distanceTraveled);
    }

    private startRun(): void {
        this.enemyPool.clear();
        this.buffPool.clear();
        this.weaponPool.clear();
        this.projectilePool.clear();

        this.backgroundView.resetDistance();
        this.gameUi.score.updateDistance(0);
        this.state = 'playing';
        this.gameUi.state.hide();
        this.signalBus.dispatch(GameSignals.RUN_RESTARTED);
    }
}
