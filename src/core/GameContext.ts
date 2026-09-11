import * as PIXI from 'pixi.js';

import { PlayerView } from '../views/PlayerView';
import { PlayerMediator } from '../mediators/PlayerMediator';
import { BackgroundMediator } from '../mediators/BackgroundMediator';
import { BackgroundView } from '../views/BackgroundView';
import { ProjectileMediator } from '../mediators/ProjectileMediator';
import { ProjectilePool } from '../pools/ProjectilePool';
import { SignalBus } from './SignalBus';
import { EnemyPool } from '../pools/EnemyPool';
import { EnemyMediator } from '../mediators/EnemyMediator';
import type { IContextItem } from './meta/IContextItem';
import { CollisionService } from '../services/CollisionService';
import { ScoreView } from '../views/ScoreView';
import { ScoreMediator } from '../mediators/ScoreMediator';
import { InputController } from './InputController';
import { gameConfig } from './GameConfig';


/**
 * Game context, manages game state and bootstraps the whole system.
 * 
 */
export class GameContext {
    private readonly app: PIXI.Application;
    private input!: InputController;

    private readonly signalBus: SignalBus;
    private readonly items: IContextItem[] = [];

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
        const projectPool = new ProjectilePool(this.app);
        const enemyPool = new EnemyPool(this.app, gameConfig);

        // Mediators
        const backgroundView = new BackgroundView(this.app, gameConfig);
        const backgroundMediator = new BackgroundMediator(backgroundView);
        this.app.stage.addChild(backgroundView);
        this.items.push(backgroundMediator);

        const playerView = new PlayerView(this.app, gameConfig);
        const playerMediator = new PlayerMediator(playerView, this.signalBus, this.input, gameConfig);
        this.app.stage.addChild(playerView);
        this.items.push(playerMediator);

        const enemyMediator = new EnemyMediator(this.app, enemyPool, gameConfig);
        this.items.push(enemyMediator);

        const projectileMediator = new ProjectileMediator(projectPool, this.signalBus, gameConfig);
        this.items.push(projectileMediator);

        const scoreView = new ScoreView();
        new ScoreMediator(scoreView, this.signalBus);
        this.app.stage.addChild(scoreView);

        // Services
        const collisionService = new CollisionService(playerView, projectPool, enemyPool, this.signalBus, gameConfig);
        this.items.push(collisionService);

        //Update Loop
        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
    }

    public update(delta: number = 0): void {
        for (const item of this.items) {
            item.update(delta);
        }
    }
}