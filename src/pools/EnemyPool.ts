import * as PIXI from 'pixi.js';
import type { GameConfig } from '../core/GameConfig';
import { EnemyView } from '../views/EnemyView';
import type { EnemyProfile } from '../views/types/EnemyProfile';

export class EnemyPool {
    public readonly activeEnemies: EnemyView[] = [];
    private readonly pool: EnemyView[] = [];

    private readonly app: PIXI.Application
    private readonly config: GameConfig;

    constructor(app: PIXI.Application, config: GameConfig) {
        this.app = app;
        this.config = config;
    }

    public spawn(x: number, y: number, profile: EnemyProfile): void {
        let enemyView = this.pool.find(e => !e.visible);

        if (enemyView) {
            enemyView.setProfile(profile);
        } else {
            enemyView = new EnemyView(this.app, profile, this.config);
            this.pool.push(enemyView);
            this.app.stage.addChild(enemyView);
        }

        enemyView.resetPosition(x, y);
        enemyView.visible = true;

        this.activeEnemies.push(enemyView);
    }

    public recycle(enemy: EnemyView, index: number): void {
        enemy.visible = false;
        this.activeEnemies.splice(index, 1);
    }

    public clear(): void {
        for (const enemy of this.activeEnemies) {
            enemy.visible = false;
        }
        this.activeEnemies.length = 0;
    }
}