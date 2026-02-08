import * as PIXI from 'pixi.js';
import { EnemyView } from '../views/EnemyView';
import { EnemyType } from '../views/meta/EnemyType';

export class EnemyPool {
    public readonly activeEnemies: EnemyView[] = [];
    private readonly pool: EnemyView[] = [];

    private readonly app: PIXI.Application

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public spawn(x: number, y: number, type: EnemyType): void {
        let enemyView = this.pool.find(e => !e.visible);

        if (enemyView) {
            enemyView.setType(type);
        } else {
            enemyView = new EnemyView(this.app, type);
            this.pool.push(enemyView);
            this.app.stage.addChild(enemyView);
        }

        enemyView.x = x;
        enemyView.y = y;
        enemyView.visible = true;

        this.activeEnemies.push(enemyView);
    }

    public recycle(enemy: EnemyView, index: number): void {
        enemy.visible = false;
        this.activeEnemies.splice(index, 1);
    }
}