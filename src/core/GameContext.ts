import * as PIXI from 'pixi.js';

import { BuffManager } from '../buffs/BuffManager';
import { BackgroundMediator } from '../mediators/BackgroundMediator';
import { BuffMediator } from '../mediators/BuffMediator';
import { CombatFeedbackMediator } from '../mediators/CombatFeedbackMediator';
import { EnemyMediator } from '../mediators/EnemyMediator';
import { ParticleMediator } from '../mediators/ParticleMediator';
import { PlayerMediator } from '../mediators/PlayerMediator';
import { ProjectileMediator } from '../mediators/ProjectileMediator';
import { ScoreMediator } from '../mediators/ScoreMediator';
import { LocalStorageSaveStorage } from '../persistence/LocalStorageSaveStorage';
import { BuffPool } from '../pools/BuffPool';
import { EnemyPool } from '../pools/EnemyPool';
import { ParticlePool } from '../pools/ParticlePool';
import { ProjectilePool } from '../pools/ProjectilePool';
import { CollisionService } from '../services/CollisionService';
import { GameUi } from '../ui/GameUi';
import { BackgroundView } from '../views/BackgroundView';
import { PlayerView } from '../views/PlayerView';
import { gameConfig } from './GameConfig';
import { GameSignals } from './GameSignals';
import type { GameState } from './GameState';
import { InputController } from './InputController';
import type { IContextItem } from './meta/IContextItem';
import { SignalBus } from './SignalBus';


/**
 * Game context, manages game state and bootstraps the whole system.
 *
 */
export class GameContext {
    private readonly app: PIXI.Application;
    private input!: InputController;

    private readonly signalBus: SignalBus;
    private readonly items: IContextItem[] = [];
    private state: GameState = 'ready';
    private readonly gameUi = new GameUi(gameConfig.showPerformanceStats);
    private enemyPool!: EnemyPool;
    private projectilePool!: ProjectilePool;
    private particleMediator!: ParticleMediator;
    private buffManager!: BuffManager;
    private backgroundView!: BackgroundView;
    private playerView!: PlayerView;

    constructor(
        app: PIXI.Application,
    ) {
        this.app = app;
        this.signalBus = new SignalBus();
    }

    /**
     * Initializes the game.
     */
    public init(): void {
        this.input = new InputController(this.app.canvas, this.app.screen.width);

        // Pools
        this.projectilePool = new ProjectilePool(this.app);
        this.enemyPool = new EnemyPool(this.app, gameConfig);
        const buffPool = new BuffPool(this.app);
        this.buffManager = new BuffManager(gameConfig, this.signalBus);

        this.playerView = new PlayerView(this.app, gameConfig);
        const playerMediator = new PlayerMediator(this.playerView, this.signalBus, this.input, this.buffManager);

        // Mediators
        this.backgroundView = new BackgroundView(this.app, gameConfig);
        const backgroundMediator = new BackgroundMediator(this.backgroundView, () => this.playerView.movementSpeedMultiplierValue);
        this.app.stage.addChild(this.backgroundView);
        this.app.renderer.on('resize', (width, height) => this.backgroundView.resize(width, height));
        this.items.push(backgroundMediator);

        this.app.stage.addChild(this.playerView);
        this.items.push(playerMediator);

        const enemyMediator = new EnemyMediator(this.app, this.enemyPool, gameConfig, this.playerView, this.signalBus);
        this.items.push(enemyMediator);

        this.items.push(this.buffManager);
        this.items.push(new BuffMediator(buffPool, gameConfig, this.signalBus, this.app.screen.height, this.playerView));

        const projectileMediator = new ProjectileMediator(this.projectilePool, this.signalBus, gameConfig, this.app.screen.height);
        this.items.push(projectileMediator);

        const combatFeedbackMediator = new CombatFeedbackMediator(this.app.stage, this.signalBus);
        this.items.push(combatFeedbackMediator);

        // Particle System
        const particlePool = new ParticlePool(this.app, gameConfig);
        this.particleMediator = new ParticleMediator(particlePool, this.signalBus);

        const scoreMediator = new ScoreMediator(this.gameUi.score, this.signalBus, new LocalStorageSaveStorage());

        this.gameUi.state.showReady(this.app.screen.width, this.app.screen.height, scoreMediator.best);
        this.app.stage.addChild(this.gameUi);

        // Services
        const collisionService = new CollisionService(
            this.playerView,
            this.projectilePool,
            this.enemyPool,
            this.signalBus,
            gameConfig,
            buffPool,
            this.buffManager,
        );
        this.items.push(collisionService);

        this.signalBus.addEventListener(GameSignals.PLAYER_DIED, () => {
            this.state = 'gameOver';
            this.gameUi.state.showGameOver(
                this.app.screen.width,
                this.app.screen.height,
                scoreMediator.current,
                scoreMediator.best,
            );
            this.app.stage.addChild(this.gameUi);
        });

        //Update Loop
        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
    }

    public update(delta: number = 0): void {
        this.gameUi.updatePerformanceStats(this.app.ticker.FPS, delta, this.app.screen.width);
        this.gameUi.updateBoostCharge(this.playerView.boostChargeValue, this.playerView.boostMaximumCharge);
        this.gameUi.updateBuffStatus(
            this.buffManager.rapidFireTimeRemaining,
            this.buffManager.rapidFireDuration,
            this.buffManager.shieldTimeRemaining,
            this.buffManager.shieldDuration,
        );

        if (this.state !== 'playing') {
            this.particleMediator.update(delta);
            if (this.input.consumeStartRequest()) {
                this.startRun();
            }
            return;
        }

        for (const item of this.items) {
            item.update(delta);
        }
        this.particleMediator.update(delta);
        this.gameUi.score.updateDistance(this.backgroundView.distanceTraveled);
    }

    private startRun(): void {
        this.enemyPool.clear();
        this.projectilePool.clear();
        this.backgroundView.resetDistance();
        this.gameUi.score.updateDistance(0);
        this.state = 'playing';
        this.gameUi.state.hide();
        this.signalBus.dispatch(GameSignals.RUN_RESTARTED);
    }
}
