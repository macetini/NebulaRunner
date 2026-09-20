import * as PIXI from 'pixi.js';

import { EnemyFactory } from '../core/EnemyFactory';
import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';
import type { EnemyPool } from "../pools/EnemyPool";
import type { PlayerView } from '../views/PlayerView';

export class EnemyMediator implements IContextItem {
    private readonly app: PIXI.Application;
    private readonly pool: EnemyPool;
    private readonly config: GameConfig;
    private readonly factory: EnemyFactory;
    private readonly player: PlayerView;

    private spawnTimer: number = 0;
    private elapsedTime: number = 0;

    constructor(app: PIXI.Application, pool: EnemyPool, config: GameConfig, player: PlayerView, signalBus: SignalBus) {
        this.app = app;
        this.pool = pool;
        this.config = config;
        this.factory = new EnemyFactory(config);
        this.player = player;
        signalBus.addEventListener(GameSignals.RUN_RESTARTED, () => {
            this.spawnTimer = 0;
            this.elapsedTime = 0;
        });
    }

    public update(delta: number): void {
        this.elapsedTime += delta / 60;
        this.spawnTimer += delta;
        if (this.spawnTimer > this.getSpawnInterval()) {
            const x = Math.random() * this.app.screen.width;
            const y = -50;
            this.pool.spawn(x, y, this.factory.createRandom(this.elapsedTime));

            this.spawnTimer = 0;
        }

        const enemies = this.pool.activeEnemies;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.y > this.app.screen.height + 50) {
                this.pool.recycle(enemy, i);
            } else {
                enemy.updateMovement(delta, this.player.x, this.getSpeedMultiplier());
            }
        }
    }

    private getSpawnInterval(): number {
        return Math.max(
            this.config.enemyMinimumSpawnInterval,
            this.config.enemySpawnInterval - this.elapsedTime * this.config.enemySpawnIntervalDecreasePerSecond,
        );
    }

    private getSpeedMultiplier(): number {
        return 1 + Math.min(
            this.config.enemyMaximumSpeedIncrease,
            this.elapsedTime * this.config.enemySpeedIncreasePerSecond,
        );
    }
}
