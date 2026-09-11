import * as PIXI from 'pixi.js';
import { GlowEffectFactory } from '../effects/GlowEffectFactory';

export class BulletView extends PIXI.Sprite {
    constructor(app: PIXI.Application) {
        
        const g = new PIXI.Graphics()
            .rect(0, 0, 3, 12)
            .fill(0xFFEE00);

        const texture = app.renderer.generateTexture(g);
        super(texture);

        this.anchor.set(0.5);
        this.filters = [GlowEffectFactory.createProjectile()];
    }
}