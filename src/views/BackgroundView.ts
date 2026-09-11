import * as PIXI from 'pixi.js';
import type { GameConfig } from '../core/GameConfig';

type BackgroundLayer = {
    view: PIXI.TilingSprite;
    speed: number;
};

export class BackgroundView extends PIXI.Container {
    private readonly layers: BackgroundLayer[] = [];

    constructor(app: PIXI.Application, config: GameConfig) {
        super();

        // Build layers from slow atmospheric detail to fast foreground stars.
        const nebulaTexture = this.generateNebulaTexture(app);
        const nebulaView = new PIXI.Sprite(nebulaTexture);
        nebulaView.width = app.screen.width;
        nebulaView.height = app.screen.height;
        this.addChild(nebulaView);

        const farStarsTexture = this.generateStarTexture(app, 30, 1.0, 0.45);
        const nearStarsTexture = this.generateStarTexture(app, 15, 2.0, 0.9);

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
     * Generates a base dark texture with procedural soft cosmic nebula clouds.
     */
    private generateNebulaTexture(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();
        
        const width = app.screen.width;
        const height = app.screen.height;
        const cloudRadius = Math.min(width, height) * 0.2;

        g.rect(0, 0, width, height).fill(0x00000a);

        this.drawNebulaCloud(g, width * 0.18, height * 0.16, cloudRadius, 0x16002A, 0.025, 0.16);
        this.drawNebulaCloud(g, width * 0.82, height * 0.38, cloudRadius * 1.15, 0x00283A, 0.02, 0.13);
        this.drawNebulaCloud(g, width * 0.42, height * 0.7, cloudRadius * 0.75, 0x3A082E, 0.02, 0.1);

        for (let index = 0; index < 26; index += 1) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 0.4 + Math.random() * 1.4;
            g.circle(x, y, size).fill({ color: 0x7895A8, alpha: 0.08 + Math.random() * 0.12 });
        }

        return app.renderer.generateTexture(g);
    }

    private drawNebulaCloud(
        graphics: PIXI.Graphics,
        centerX: number,
        centerY: number,
        radius: number,
        color: number,
        edgeAlpha: number,
        coreAlpha: number,
    ): void {
        const ringCount = 8;
        for (let ring = ringCount; ring >= 1; ring -= 1) {
            const progress = ring / ringCount;
            const ringRadius = radius * progress;
            const alpha = edgeAlpha + (coreAlpha - edgeAlpha) * (1 - progress);
            graphics.circle(centerX, centerY, ringRadius).fill({ color, alpha });
            }
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
        for (const layer of this.layers) {
            layer.view.tilePosition.y += layer.speed * delta;
        }
    }
}
