import * as PIXI from 'pixi.js';

import type { EnemyPool } from "../pools/EnemyPool";
import { EnemyType } from "../views/types/EnemyType";
import type { IContextItem } from '../core/meta/IContextItem';

export class EnemyMediator implements IContextItem {
    private readonly SPAWN_INTERVAL: number = 100;

    private readonly app: PIXI.Application;
    private readonly pool: EnemyPool;

    private spawnTimer: number = 0;

    constructor(app: PIXI.Application, pool: EnemyPool) {
        this.app = app;
        this.pool = pool;
    }

    public update(delta: number): void {
        this.spawnTimer += delta;
        if (this.spawnTimer > this.SPAWN_INTERVAL) {
            const x = this.app.screen.width;
            const y = Math.random() * this.app.screen.height;
            const type = Math.random() > 0.5 ? EnemyType.DIAGONAL : EnemyType.SINE;
            this.pool.spawn(x, y, type);

            this.spawnTimer = 0;
        }

        const enemies = this.pool.activeEnemies;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.x < -50) {
                this.pool.recycle(enemy, i);
            } else {
                enemy.updateMovement(delta);
            }
        }
    }
}