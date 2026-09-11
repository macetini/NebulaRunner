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
    private readonly nebulaView: PIXI.Sprite;
    private readonly nebulaSpeed: number;
    private readonly nebulaBaseX: number;
    private readonly nebulaBaseY: number;
    private nebulaTime = 0;

    constructor(app: PIXI.Application, config: GameConfig) {
        super();
        this.mask = new PIXI.Graphics()
            .rect(0, 0, app.screen.width, app.screen.height)
            .fill(0xFFFFFF);

        // Build layers from slow atmospheric detail to fast foreground stars.
        const nebulaTexture = this.generateNebulaTexture(app);
        const farStarsTexture = this.generateStarTexture(app, 30, 1.0, 0.45);
        const nearStarsTexture = this.generateStarTexture(app, 15, 2.0, 0.9);

        this.nebulaView = new PIXI.Sprite(nebulaTexture);
        this.nebulaView.width = app.screen.width * 1.12;
        this.nebulaView.height = app.screen.height * 1.12;
        this.nebulaBaseX = (app.screen.width - this.nebulaView.width) * 0.5;
        this.nebulaBaseY = (app.screen.height - this.nebulaView.height) * 0.5;
        this.nebulaView.position.set(this.nebulaBaseX, this.nebulaBaseY);
        this.addChild(this.nebulaView);
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
     * Generates a base dark texture with procedural soft cosmic nebula clouds.
     */
    private generateNebulaTexture(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();
        
        const width = app.screen.width;
        const height = app.screen.height;
        const cloudRadius = Math.min(width, height) * 0.2;

        g.rect(0, 0, width, height).fill(0x00000a);

        this.drawNebulaCloud(
            g,
            this.getRandomRange(width * 0.15, width * 0.85),
            this.getRandomRange(height * 0.1, height * 0.35),
            this.getRandomRange(cloudRadius * 0.75, cloudRadius * 1.25),
            this.getRandomNebulaColor(),
            0.008,
            0.07,
        );
        this.drawNebulaCloud(
            g,
            this.getRandomRange(width * 0.15, width * 0.85),
            this.getRandomRange(height * 0.3, height * 0.65),
            this.getRandomRange(cloudRadius * 0.85, cloudRadius * 1.35),
            this.getRandomNebulaColor(),
            0.006,
            0.06,
        );
        this.drawNebulaCloud(
            g,
            this.getRandomRange(width * 0.15, width * 0.85),
            this.getRandomRange(height * 0.6, height * 0.9),
            this.getRandomRange(cloudRadius * 0.55, cloudRadius),
            this.getRandomNebulaColor(),
            0.006,
            0.05,
        );

        for (let index = 0; index < 26; index += 1) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 0.4 + Math.random() * 1.4;
            g.circle(x, y, size).fill({ color: 0x7895A8, alpha: 0.08 + Math.random() * 0.12 });
        }

        return app.renderer.generateTexture(g);
    }

    private getRandomNebulaColor(): number {
        const colorIndex = Math.floor(Math.random() * BackgroundView.NEBULA_COLORS.length);
        return BackgroundView.NEBULA_COLORS[colorIndex] ?? BackgroundView.NEBULA_COLORS[0];
    }

    private getRandomRange(minimum: number, maximum: number): number {
        return minimum + Math.random() * (maximum - minimum);
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
        const ringCount = 20;
        for (let ring = ringCount; ring >= 1; ring -= 1) {
            const progress = ring / ringCount;
            const ringRadius = radius * progress;
            const blend = 1 - progress;
            const smoothBlend = blend * blend * (3 - 2 * blend);
            const alpha = edgeAlpha + (coreAlpha - edgeAlpha) * smoothBlend;
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
        this.nebulaTime += delta * this.nebulaSpeed * 0.01;
        this.nebulaView.x = this.nebulaBaseX + Math.sin(this.nebulaTime) * 8;
        this.nebulaView.y = this.nebulaBaseY + Math.cos(this.nebulaTime * 0.8) * 8;

        for (const layer of this.layers) {
            layer.view.tilePosition.y += layer.speed * delta;
        }
    }
}
