import * as PIXI from 'pixi.js';
import type { GameConfig } from '../core/GameConfig';

type BackgroundLayer = {
    view: PIXI.TilingSprite;
    speed: number;
};

export class BackgroundView extends PIXI.Container {
    private static readonly NEBULA_COLORS = [
        0x16002A,
        0x00283A,
        0x3A082E,
        0x101F4A,
        0x272044,
        0x003A38,
    ];

    private readonly layers: BackgroundLayer[] = [];
    private readonly nebulaSpeed: number;
    private nebulaTime = 0;

    constructor(app: PIXI.Application, config: GameConfig) {
        super();
        this.mask = new PIXI.Graphics()
            .rect(0, 0, app.screen.width, app.screen.height)
            .fill(0xFFFFFF);

        // Build layers from slow atmospheric detail to fast foreground stars.
        const farStarsTexture = this.generateStarTexture(app, 30, 1.0, 0.45);
        const nearStarsTexture = this.generateStarTexture(app, 15, 2.0, 0.9);

        this.nebulaSpeed = config.backgroundSpeed * 0.08;

        this.addLayer(app, farStarsTexture, config.backgroundSpeed * 0.45);
        this.addLayer(app, nearStarsTexture, config.backgroundSpeed * 1.0);
    }

    /**
     * Helper to create and stack a TilingSprite layer.
     */
    private addLayer(app: PIXI.Application, texture: PIXI.Texture, speed: number): void {
        const tilingSprite = new PIXI.TilingSprite({
            texture,
            width: app.screen.width,
            height: app.screen.height,
        });
        tilingSprite.anchor.set(0);
        this.addChild(tilingSprite);
        this.layers.push({ view: tilingSprite, speed });
    }

    /**
     * Generates a transparent texture scattered with procedural dots (stars).
     */
    private generateStarTexture(app: PIXI.Application, count: number, size: number, maxAlpha: number): PIXI.Texture {
        const g = new PIXI.Graphics();

        // Background remains transparent
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const alpha = 0.2 + Math.random() * (maxAlpha - 0.2);

            // Give stars a slight variance in color (white, pale yellow, pale blue)
            const colorRoll = Math.random();
            let color = 0xFFFFFF; // default white
            if (colorRoll > 0.85) {
                color = 0xAAEEFF; // hot blue star
            } else if (colorRoll > 0.7) {
                color = 0xFFFEE0; // yellow star
            }

            g.circle(x, y, size * 0.5).fill({ color, alpha });
        }

        return app.renderer.generateTexture(g);
    }

    /**
     * Scrolls all active layers downwards at their respective parallax speeds.
     */
    public moveDown(delta: number): void {
        this.nebulaTime += delta * this.nebulaSpeed * 0.01;

        for (const layer of this.layers) {
            layer.view.tilePosition.y += layer.speed * delta;
        }
    }
}
