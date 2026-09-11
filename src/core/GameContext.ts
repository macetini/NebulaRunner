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


/**
 * Game context, manages game state and bootstraps the whole system.
 * 
 */
export class GameContext {
    private readonly app: PIXI.Application;
    private readonly keys: Record<string, boolean> = {};
    private readonly touch = {
        active: false,
        pointerId: null as number | null,
        x: 0,
    };

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
        this.setupInput();

        // Pools
        const projectPool = new ProjectilePool(this.app);
        const enemyPool = new EnemyPool(this.app);

        // Mediators
        const backgroundView = new BackgroundView(this.app);
        const backgroundMediator = new BackgroundMediator(backgroundView);
        this.app.stage.addChild(backgroundView);
        this.items.push(backgroundMediator);

        const playerView = new PlayerView(this.app);
        const playerMediator = new PlayerMediator(playerView, this.signalBus, this.keys, this.touch);
        this.app.stage.addChild(playerView);
        this.items.push(playerMediator);

        const enemyMediator = new EnemyMediator(this.app, enemyPool);
        this.items.push(enemyMediator);

        const projectileMediator = new ProjectileMediator(projectPool, this.signalBus);
        this.items.push(projectileMediator);

        const scoreView = new ScoreView();
        new ScoreMediator(scoreView, this.signalBus);
        this.app.stage.addChild(scoreView);

        // Services
        const collisionService = new CollisionService(playerView, projectPool, enemyPool, this.signalBus);
        this.items.push(collisionService);

        //Update Loop
        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
    }

    private setupInput(): void {
        globalThis.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        globalThis.addEventListener('keyup', (e) => this.keys[e.code] = false);

        this.app.canvas.addEventListener('pointerdown', (event) => {
            if (this.touch.active) {
                return;
            }

            this.touch.active = true;
            this.touch.pointerId = event.pointerId;
            this.touch.x = this.getCanvasX(event.clientX);
        });
        this.app.canvas.addEventListener('pointermove', (event) => {
            if (this.touch.active && this.touch.pointerId === event.pointerId) {
                this.touch.x = this.getCanvasX(event.clientX);
            }
        });
        globalThis.addEventListener('pointerup', (event) => {
            if (this.touch.pointerId === event.pointerId) {
                this.touch.active = false;
                this.touch.pointerId = null;
            }
        });
        globalThis.addEventListener('pointercancel', (event) => {
            if (this.touch.pointerId === event.pointerId) {
                this.touch.active = false;
                this.touch.pointerId = null;
            }
        });
    }

    private getCanvasX(clientX: number): number {
        const bounds = this.app.canvas.getBoundingClientRect();
        return ((clientX - bounds.left) / bounds.width) * this.app.screen.width;
    }

    public update(delta: number = 0): void {
        for (const item of this.items) {
            item.update(delta);
        }
    }
}