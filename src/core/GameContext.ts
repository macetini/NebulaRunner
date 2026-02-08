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

export class GameContext {
    private readonly app: PIXI.Application;
    private readonly keys: Record<string, boolean> = {};

    private readonly signalBus: SignalBus;
    private readonly items: IContextItem[] = [];

    constructor(
        app: PIXI.Application,
    ) {
        this.app = app;
        this.signalBus = new SignalBus();
    }

    public init(): void {
        this.setupInput();

        // Pools
        const projectPool = new ProjectilePool(this.app);
        const enemyPool = new EnemyPool(this.app);

        // Mediators
        const backgroundView = new BackgroundView(this.app);
        this.app.stage.addChild(backgroundView);
        const backgroundMediator = new BackgroundMediator(backgroundView);
        this.items.push(backgroundMediator);

        const playerView = new PlayerView(this.app);
        this.app.stage.addChild(playerView);
        const playerMediator = new PlayerMediator(playerView, this.signalBus, this.keys);
        this.items.push(playerMediator);

        const enemyMediator = new EnemyMediator(this.app, enemyPool);
        this.items.push(enemyMediator);

        const projectileMediator = new ProjectileMediator(projectPool, this.signalBus, this.app.screen.width);
        this.items.push(projectileMediator);

        // Services
        const collisionService = new CollisionService(projectPool, enemyPool, this.signalBus);
        this.items.push(collisionService);

        //Update Loop
        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
    }

    private setupInput() {
        globalThis.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        globalThis.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    public update(delta: number): void {
        for (const item of this.items) {
            item.update(delta);
        }
    }
}