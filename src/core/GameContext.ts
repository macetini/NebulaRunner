import * as PIXI from 'pixi.js';

import { BackgroundMediator } from '../mediators/BackgroundMediator';
import { EnemyMediator } from '../mediators/EnemyMediator';
import { PlayerMediator } from '../mediators/PlayerMediator';
import { ProjectileMediator } from '../mediators/ProjectileMediator';
import { ScoreMediator } from '../mediators/ScoreMediator';
import { EnemyPool } from '../pools/EnemyPool';
import { ProjectilePool } from '../pools/ProjectilePool';
import { CollisionService } from '../services/CollisionService';
import { BackgroundView } from '../views/BackgroundView';
import { GameStateView } from '../views/GameStateView';
import { PlayerView } from '../views/PlayerView';
import { ScoreView } from '../views/ScoreView';
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
    private readonly stateView = new GameStateView();
    private enemyPool!: EnemyPool;
    private projectilePool!: ProjectilePool;

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

        // Mediators
        const backgroundView = new BackgroundView(this.app, gameConfig);
        const backgroundMediator = new BackgroundMediator(backgroundView);
        this.app.stage.addChild(backgroundView);
        this.items.push(backgroundMediator);

        const playerView = new PlayerView(this.app, gameConfig);
        const playerMediator = new PlayerMediator(playerView, this.signalBus, this.input, gameConfig);
        this.app.stage.addChild(playerView);
        this.items.push(playerMediator);

        const enemyMediator = new EnemyMediator(this.app, this.enemyPool, gameConfig, playerView, this.signalBus);
        this.items.push(enemyMediator);

        const projectileMediator = new ProjectileMediator(this.projectilePool, this.signalBus, gameConfig);
        this.items.push(projectileMediator);

        const scoreView = new ScoreView();
        new ScoreMediator(scoreView, this.signalBus);
        this.app.stage.addChild(scoreView);
        this.stateView.showReady(this.app.screen.width, this.app.screen.height);
        this.app.stage.addChild(this.stateView);

        // Services
        const collisionService = new CollisionService(playerView, this.projectilePool, this.enemyPool, this.signalBus, gameConfig);
        this.items.push(collisionService);

        this.signalBus.addEventListener(GameSignals.PLAYER_DIED, () => {
            this.state = 'gameOver';
            this.stateView.showGameOver(this.app.screen.width, this.app.screen.height);
            this.app.stage.addChild(this.stateView);
        });

        //Update Loop
        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
    }

    public update(delta: number = 0): void {
        if (this.state !== 'playing') {
            if (this.input.consumeStartRequest()) {
                this.startRun();
            }
            return;
        }

        for (const item of this.items) {
            item.update(delta);
        }
    }

    private startRun(): void {
        this.enemyPool.clear();
        this.projectilePool.clear();
        this.state = 'playing';
        this.stateView.hide();
        this.signalBus.dispatch(GameSignals.RUN_RESTARTED);
    }
}