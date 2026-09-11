import * as PIXI from 'pixi.js';
import type { GameConfig } from '../core/GameConfig';

export class BackgroundView extends PIXI.TilingSprite {
    // Consts
    private readonly config: GameConfig;

    constructor(app: PIXI.Application, config: GameConfig) {
        super(PIXI.Texture.EMPTY);
        this.config = config;
        const g = new PIXI.Graphics();
        g.rect(0, 0, 256, 256).fill(0x000015);

        for (let i = 0; i < 20; i++) {
            g.circle(Math.random() * 256, Math.random() * 256, Math.random() * 1.5).fill(0xFFFFFF);
        }
        const texture = app.renderer.generateTexture(g);

        this.texture = texture;

        this.width = app.screen.width;
        this.height = app.screen.height;
        this.anchor.set(0);
    }

    public moveDown(delta: number): void {
        this.tilePosition.y += this.config.backgroundSpeed * delta;
    }
}