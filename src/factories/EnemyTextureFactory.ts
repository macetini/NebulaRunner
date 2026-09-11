import * as PIXI from 'pixi.js';
import { EnemyType } from '../views/types/EnemyType';

export class EnemyTextureFactory {
    private static readonly textures = new Map<EnemyType, PIXI.Texture>();

    public static getTextures(app: PIXI.Application): Map<EnemyType, PIXI.Texture> {
        if (this.textures.size > 0) {
            return this.textures;
        }

        const graphics = new PIXI.Graphics();
        graphics.clear().poly([15, 0, 0, 15, -15, 0, 0, -15]).fill(0xFF3333);
        this.textures.set(
            EnemyType.FAST_DIVER,
            app.renderer.generateTexture(graphics),
        );

        graphics.clear().poly([0, 15, -15, -15, 15, -15]).fill(0xAA33FF);
        this.textures.set(
            EnemyType.DRIFTER,
            app.renderer.generateTexture(graphics),
        );

        graphics.clear().circle(0, 0, 15).fill(0xFFAA33);
        this.textures.set(
            EnemyType.CHASER,
            app.renderer.generateTexture(graphics),
        );

        graphics.clear()
            .poly([0, -17, 15, -8, 15, 8, 0, 17, -15, 8, -15, -8])
            .fill(0x33AAFF);
        this.textures.set(
            EnemyType.ARMORED,
            app.renderer.generateTexture(graphics),
        );

        return this.textures;
    }
}
