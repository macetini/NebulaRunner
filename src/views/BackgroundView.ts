import * as PIXI from 'pixi.js';

export class BackgroundView extends PIXI.TilingSprite {
    // Consts
    private readonly SPEED: number = 3;

    constructor(app: PIXI.Application) {
        const g = new PIXI.Graphics();
        g.rect(0, 0, 256, 256).fill(0x000015);
        // Draw 20 random stars
        for (let i = 0; i < 20; i++) {
            g.circle(Math.random() * 256, Math.random() * 256, Math.random() * 1.5).fill(0xFFFFFF);
        }
        const texture = app.renderer.generateTexture(g);

        super(texture);

        this.width = app.screen.width;
        this.height = app.screen.height;
        this.anchor.set(0);
    }

    public moveLeft(delta: number): void {
        this.tilePosition.x -= this.SPEED * delta;
    }
}