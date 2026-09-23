import * as PIXI from 'pixi.js';
import { BulletView } from '../views/BulletView';
import type { ProjectileSpawnOptions } from '../weapons/config/ProjectileConfig';

export class ProjectilePool {
    private readonly app: PIXI.Application

    public readonly activeBullets: BulletView[] = [];
    private readonly pool: BulletView[] = [];

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public spawn(x: number, y: number, isEnemy: boolean = false, options?: ProjectileSpawnOptions): void {
        let bulletView = this.pool.find(pooledBullet => !pooledBullet.visible);

        if (!bulletView) {
            bulletView = new BulletView(this.app);
            this.pool.push(bulletView);
            this.app.stage.addChild(bulletView);
        }

        bulletView.setType(isEnemy);
        if (options) {
            bulletView.configure(options);
        }
        bulletView.x = x;
        bulletView.y = y;
        bulletView.visible = true;

        this.activeBullets.push(bulletView);
    }

    /**
     * Spawns or updates a continuous beam projectile segment extending upward from (x, y).
     */
    public spawnBeamSegment(
        x: number,
        y: number,
        options: { width?: number; damage?: number; isPiercing?: boolean } = {}
    ): void {
        this.spawn(x, y - 20, false, {
            vx: 0,
            vy: 0,
            damage: options.damage ?? 0.5,
            behavior: 'laser_beam',
            effect: {
                shape: 'beam',
                color: 0xffffff,
                radius: (options.width ?? 16) / 2,
                width: options.width ?? 16,
            },
            extraData: { isPiercing: options.isPiercing ?? false },
        });
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
