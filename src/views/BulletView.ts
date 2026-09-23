import * as PIXI from 'pixi.js';
import { GlowEffectFactory } from '../factories/GlowEffectFactory';
import type { ProjectileSpawnOptions } from '../weapons/config/ProjectileConfig';

export class BulletView extends PIXI.Sprite {
    public isEnemy: boolean = false;
    public damage = 1;
    public isPiercing = false;
    private static playerTexture: PIXI.Texture | null = null;
    private static enemyTexture: PIXI.Texture | null = null;

    constructor(app: PIXI.Application) {
        if (!BulletView.playerTexture) {
            const g = new PIXI.Graphics()
                .rect(0, 0, 3, 12)
                .fill(0xFFEE00);
            BulletView.playerTexture = app.renderer.generateTexture(g);
        }
        if (!BulletView.enemyTexture) {
            const g = new PIXI.Graphics()
                .rect(0, 0, 3, 12)
                .fill(0xFF3333);
            BulletView.enemyTexture = app.renderer.generateTexture(g);
        }

        super(BulletView.playerTexture);
        this.anchor.set(0.5);
        this.filters = [GlowEffectFactory.createProjectile()];
    }

    public setType(isEnemy: boolean): void {
        this.isEnemy = isEnemy;
        this.texture = isEnemy ? BulletView.enemyTexture! : BulletView.playerTexture!;
        this.filters = [GlowEffectFactory.createProjectile(isEnemy ? 0xFF3333 : 0xFFEE00)];
        this.damage = 1;
        this.isPiercing = false;
        this.width = this.texture.width;
        this.height = this.texture.height;
    }

    public configure(options: ProjectileSpawnOptions): void {
        this.damage = options.damage ?? 1;
        this.isPiercing = options.extraData?.isPiercing === true;

        if (options.effect?.width !== undefined) {
            this.width = options.effect.width;
        }
        if (options.effect?.height !== undefined) {
            this.height = options.effect.height;
        }
    }
}
