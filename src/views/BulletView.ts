import * as PIXI from 'pixi.js';
import { GlowEffectFactory } from '../effects/GlowEffectFactory';

export class BulletView extends PIXI.Sprite {
    public isEnemy: boolean = false;
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
    }
}
