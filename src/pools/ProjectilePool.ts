import * as PIXI from 'pixi.js';
import { BulletView } from '../views/BulletView';

export class ProjectilePool {
    private readonly app: PIXI.Application

    public readonly activeBullets: BulletView[] = [];
    private readonly pool: BulletView[] = [];

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public spawn(x: number, y: number, isEnemy: boolean = false): void {
        let bulletView = this.pool.find(pooledBullet => !pooledBullet.visible);

        if (!bulletView) {
            bulletView = new BulletView(this.app);
            this.pool.push(bulletView);
            this.app.stage.addChild(bulletView);
        }

        bulletView.setType(isEnemy);
        bulletView.x = x;
        bulletView.y = y;
        bulletView.visible = true;

        this.activeBullets.push(bulletView);
    }

    /**
     * Returns a bullet to the pool by hiding it 
     * and removing it from the active tracking list.
     */
    public recycle(bullet: BulletView, index: number): void {
        bullet.visible = false;
        this.activeBullets.splice(index, 1);
    }

    public clear(): void {
        for (const bullet of this.activeBullets) {
            bullet.visible = false;
        }
        this.activeBullets.length = 0;
    }
}