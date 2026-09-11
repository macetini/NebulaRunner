import * as PIXI from 'pixi.js';

import type { EnemyPool } from "../pools/EnemyPool";
import { EnemyType } from "../views/types/EnemyType";
import type { IContextItem } from '../core/meta/IContextItem';
import type { GameConfig } from '../core/GameConfig';

export class EnemyMediator implements IContextItem {
    private readonly app: PIXI.Application;
    private readonly pool: EnemyPool;
    private readonly config: GameConfig;

    private spawnTimer: number = 0;

    constructor(app: PIXI.Application, pool: EnemyPool, config: GameConfig) {
        this.app = app;
        this.pool = pool;
        this.config = config;
    }

    public update(delta: number): void {
        this.spawnTimer += delta;
        if (this.spawnTimer > this.config.enemySpawnInterval) {
            const x = Math.random() * this.app.screen.width;
            const y = -50;
            const type = Math.random() > 0.5 ? EnemyType.DIAGONAL : EnemyType.SINE;
            this.pool.spawn(x, y, type);

            this.spawnTimer = 0;
        }

        const enemies = this.pool.activeEnemies;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.y > this.app.screen.height + 50) {
                this.pool.recycle(enemy, i);
            } else {
                enemy.updateMovement(delta);
            }
        }
    }
}