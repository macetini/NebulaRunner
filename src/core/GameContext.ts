import * as PIXI from 'pixi.js';

import { PlayerView } from '../views/PlayerView';
import { PlayerMediator } from '../mediators/PlayerMediator';
import { BackgroundMediator } from '../mediators/BackgroundMediator';
import { BackgroundView } from '../views/BackgroundView';
import { ProjectileMediator } from '../mediators/ProjectileMediator';
import { ProjectilePool } from '../pools/ProjectilePool';
import { SignalBus } from './SignalBus';

export class GameContext {
    private readonly app: PIXI.Application;
    private readonly keys: Record<string, boolean> = {};

    private readonly signalBus: SignalBus;
    private projectPool: ProjectilePool;
    private readonly mediators: any[] = [];

    constructor(
        app: PIXI.Application,
    ) {
        this.app = app;
        this.signalBus = new SignalBus();
        this.projectPool = new ProjectilePool(this.app);
    }

    public init(): void {
        this.setupInput();

        this.projectPool = new ProjectilePool(this.app);

        const backgroundView = new BackgroundView(this.app);
        this.app.stage.addChild(backgroundView);
        const backgroundMediator = new BackgroundMediator(backgroundView);
        this.mediators.push(backgroundMediator);

        const playerView = new PlayerView(this.app);
        this.app.stage.addChild(playerView);
        const playerMediator = new PlayerMediator(playerView,  this.signalBus, this.keys);
        this.mediators.push(playerMediator);

        const projectileMediator = new ProjectileMediator(this.projectPool, this.signalBus, this.app.screen.width);
        this.mediators.push(projectileMediator);

        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
    }

    private setupInput() {
        globalThis.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        globalThis.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }


    public update(delta: number): void {
        for (const mediator of this.mediators) {
            mediator.update(delta);
        }
    }
}