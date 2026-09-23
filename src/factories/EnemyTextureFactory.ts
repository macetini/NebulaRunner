import * as PIXI from 'pixi.js';
import { EnemyType } from '../views/combat/types/EnemyType';

export class EnemyTextureFactory {
    private static readonly textures = new Map<EnemyType, PIXI.Texture>();

    public static getTextures(app: PIXI.Application): Map<EnemyType, PIXI.Texture> {
        if (this.textures.size > 0) {
            return this.textures;
        }

        this.textures.set(EnemyType.FAST_DIVER, this.createFastDiver(app));
        this.textures.set(EnemyType.DRIFTER, this.createDrifter(app));
        this.textures.set(EnemyType.CHASER, this.createChaser(app));
        this.textures.set(EnemyType.ARMORED, this.createArmored(app));
        this.textures.set(EnemyType.SINE_CHAIN, this.createSineChain(app));
        this.textures.set(EnemyType.SWARMER, this.createSwarmer(app));
        this.textures.set(EnemyType.STRIKER, this.createStriker(app));
        this.textures.set(EnemyType.STATIC_BOX, this.createStaticBox(app));

        return this.textures;
    }

    /**
     * FAST_DIVER: A sleek, piercing dart shape.
     */
    private static createFastDiver(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        // Engine flare
        g.poly([-3, -10, 3, -10, 0, -22]).fill(0xFF9999);

        // Main sharp hull
        g.poly([0, 18, 8, -10, 0, -4, -8, -10])
            .fill(0x220000)
            .stroke({ width: 2, color: 0xFF3333 });

        return app.renderer.generateTexture(g);
    }

    /**
     * DRIFTER: A curved, alien crescent / manta-ray shape.
     */
    private static createDrifter(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        // Swept wings
        g.moveTo(0, 12)
            .quadraticCurveTo(15, 0, 18, -15)
            .quadraticCurveTo(0, -5, 0, -8)
            .quadraticCurveTo(0, -5, -18, -15)
            .quadraticCurveTo(-15, 0, 0, 12)
            .fill(0x1A0033)
            .stroke({ width: 2, color: 0xAA33FF });

        // Pulsing core
        g.circle(0, 0, 3).fill(0xAA33FF);

        return app.renderer.generateTexture(g);
    }

    /**
     * CHASER: An aggressive circular saw / pincer shape.
     */
    private static createChaser(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        // Core housing
        g.circle(0, 0, 10)
            .fill(0x331100)
            .stroke({ width: 2, color: 0xFFAA33 });

        // Tracking pincers (pointing down towards +Y)
        g.poly([-12, 0, -8, 16, -4, 8]).fill(0xFFAA33);
        g.poly([12, 0, 8, 16, 4, 8]).fill(0xFFAA33);

        // Robotic eye
        g.circle(0, 3, 3).fill(0xFFFFFF);

        return app.renderer.generateTexture(g);
    }

    /**
     * ARMORED: A bulky, heavily plated hexagonal tank.
     */
    private static createArmored(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        // Heavy outer blast shield
        g.poly([0, 18, 15, 8, 15, -8, 0, -18, -15, -8, -15, 8])
            .fill(0x001133)
            .stroke({ width: 2, color: 0x33AAFF });

        // Inner reinforcement plating
        g.poly([0, 12, 10, 5, 10, -5, 0, -12, -10, -5, -10, 5])
            .fill(0x33AAFF);

        // Protected core
        g.rect(-3, -3, 6, 6).fill(0xFFFFFF);

        return app.renderer.generateTexture(g);
    }

    /**
     * SINE_CHAIN: A biomechanical segment that looks interlocking.
     */
    private static createSineChain(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        // Swept segment body
        g.poly([0, 12, 12, 0, 6, -10, -6, -10, -12, 0])
            .fill(0x002211)
            .stroke({ width: 2, color: 0x33FF99 });

        // Connecting visual node
        g.circle(0, -8, 4).fill(0x33FF99);

        return app.renderer.generateTexture(g);
    }

    /**
     * SWARMER: A tiny, high-tech X-wing drone.
     */
    private static createSwarmer(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        g.poly([0, 10, 12, -2, 4, -2, 0, -8, -4, -2, -12, -2])
            .fill(0x33001A)
            .stroke({ width: 2, color: 0xFF3399 });

        g.circle(0, 0, 2).fill(0xFFFFFF);

        return app.renderer.generateTexture(g);
    }

    /**
     * STRIKER: A heavy forward-swept interceptor.
     */
    private static createStriker(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        // Wide aggressive wings
        g.poly([
            0, 16,      // Nose
            12, -2,     // Right wing inner
            4, -2,      // Right indent
            14, -12,    // Right wing tip
            4, -8,      // Right engine block
            0, -4,      // Center back
            -4, -8,     // Left engine block
            -14, -12,   // Left wing tip
            -4, -2,     // Left indent
            -12, -2     // Left wing inner
        ])
            .fill(0x220000)
            .stroke({ width: 2, color: 0xFF4422 });

        // Cockpit window
        g.poly([0, 6, 3, -1, -3, -1]).fill(0xFFFF00);

        return app.renderer.generateTexture(g);
    }

    private static createStaticBox(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        g.roundRect(-18, -18, 36, 36, 4)
            .fill(0x352400)
            .stroke({ width: 2, color: 0xFFCC33 });
        g.rect(-10, -10, 20, 20).stroke({ width: 1, color: 0xFFF0A0 });
        g.circle(0, 0, 3).fill(0xFFFFFF);

        return app.renderer.generateTexture(g);
    }
}
