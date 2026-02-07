import * as PIXI from 'pixi.js';

export class BulletView extends PIXI.Sprite {

    constructor(app: PIXI.Application) {

        const g = new PIXI.Graphics()
            .rect(0, 0, 12, 3)
            .fill(0xFFEE00);

        const texture = app.renderer.generateTexture(g);
        super(texture);

        this.anchor.set(0.5);
    }
}