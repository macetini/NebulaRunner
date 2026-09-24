import * as PIXI from 'pixi.js';

import { BuffSystem } from '../../buffs/BuffSystem';
import { CombatMediator } from '../../mediators/combat/CombatMediator';
import { PlasmaBeamMediator } from '../../mediators/combat/PlasmaBeamMediator';
import { ProjectileMediator } from '../../mediators/combat/ProjectileMediator';
import { WeaponDropMediator } from '../../mediators/combat/WeaponDropMediator';
import { WeaponSystemMediator } from '../../mediators/combat/WeaponSystemMediator';
import { BackgroundMediator } from '../../mediators/fx/BackgroundMediator';
import { ParticleMediator } from '../../mediators/fx/ParticleMediator';
import { BuffDropMediator } from '../../mediators/gameplay/BuffDropMediator';
import { EnemyMediator } from '../../mediators/gameplay/EnemyMediator';
import { PlayerMediator } from '../../mediators/gameplay/PlayerMediator';
import { ScoreMediator } from '../../mediators/ui/ScoreMediator';
import { LocalStorageSaveStorage } from '../../persistence/LocalStorageSaveStorage';
import { BuffPool } from '../../pools/BuffPool';
import { EnemyPool } from '../../pools/EnemyPool';
import { HitboxPool } from '../../pools/HitboxPool';
import { ParticlePool } from '../../pools/ParticlePool';
import { WeaponPool } from '../../pools/WeaponPickupPool';
import { CollisionService } from '../../services/CollisionService';
import { WeaponContainerView } from '../../views/combat/WeaponContainerView';
import { PlasmaBeamView } from '../../views/combat/weaponViews/PlasmaBeamView';
import { BackgroundView } from '../../views/fx/BackgroundView';
import { PlayerView } from '../../views/gameplay/PlayerView';
import { GameUi } from '../../views/ui/GameUi';
import { WeaponSystem } from '../../weapons/WeaponSystem';
import type { GameBootstrapData } from '../bootstrap/GameBootstrapData';
import type { IContextItem } from '../context/meta/IContextItem';
import { gameConfig } from './GameConfig';
import { GameSignals } from './GameSignals';
import type { GameState } from './GameState';
import { InputController } from './InputController';
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

    // Core Pools
    private enemyPool!: EnemyPool;
    private buffPool!: BuffPool;
    private weaponPool!: WeaponPool;
    private hitboxPool!: HitboxPool;

    // Core Systems
    private buffSystem!: BuffSystem;
    private weaponSystem!: WeaponSystem;

    // Views
    private backgroundView!: BackgroundView;
    private playerView!: PlayerView;
    private weaponContainerView!: WeaponContainerView;
    private plasmaBeamView!: PlasmaBeamView;

    private debugHitboxContainer?: PIXI.Container;

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
    public init(bootstrapData: GameBootstrapData): void {
        this.input = new InputController(this.app.canvas, this.app.screen.width);

        this.initPools();
        this.initSystems(bootstrapData);
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

    private initPools(): void {
        this.hitboxPool = new HitboxPool(gameConfig.showWeaponHitboxes);
        this.enemyPool = new EnemyPool(this.app, gameConfig);
        this.buffPool = new BuffPool(this.app);
        this.weaponPool = new WeaponPool(this.app);
    }

    private initSystems(data: GameBootstrapData): void {
        this.buffSystem = new BuffSystem(gameConfig, this.signalBus);
        this.weaponSystem = new WeaponSystem(data.balance.weapons);

        this.updatables.push(this.buffSystem);
        this.updatables.push(this.weaponSystem);
    }

    private initViews(): void {
        this.backgroundView = new BackgroundView(this.app, gameConfig);
        this.playerView = new PlayerView(this.app, gameConfig);

        this.weaponContainerView = new WeaponContainerView();
        this.plasmaBeamView = new PlasmaBeamView(this.app.screen.height);
        this.weaponContainerView.registerWeaponView('plasma_beam', this.plasmaBeamView);

        this.app.stage.addChild(this.backgroundView);
        this.app.stage.addChild(this.playerView);
        this.app.stage.addChild(this.weaponContainerView);

        if (gameConfig.showWeaponHitboxes) {
            this.debugHitboxContainer = new PIXI.Container();
            this.app.stage.addChild(this.debugHitboxContainer);
        }

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
            new PlasmaBeamMediator(this.plasmaBeamView, this.playerView, this.weaponSystem),
            new WeaponDropMediator(this.weaponPool, gameConfig, this.signalBus, this.app.screen.height, this.playerView),
        );

        // Buffs & Combat Feedback
        this.updatables.push(
            new BuffDropMediator(this.buffPool, gameConfig, this.signalBus, this.app.screen.height, this.playerView),
            new ProjectileMediator(this.hitboxPool, this.signalBus, gameConfig, this.app.screen.height, this.debugHitboxContainer),
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
            this.hitboxPool,
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

        this.weaponContainerView.update(delta);

        this.particleMediator.update(delta);
        this.gameUi.score.updateDistance(this.backgroundView.distanceTraveled);
    }

    private startRun(): void {
        this.enemyPool.clear();
        this.buffPool.clear();
        this.weaponPool.clear();
        this.hitboxPool.clear();

        this.backgroundView.resetDistance();
        this.gameUi.score.updateDistance(0);
        this.state = 'playing';
        this.gameUi.state.hide();
        this.signalBus.dispatch(GameSignals.RUN_RESTARTED);
    }
}
