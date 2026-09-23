import * as PIXI from 'pixi.js';

type IconDrawer = (g: PIXI.Graphics, half: number) => void;

export class WeaponTextureFactory {
    private static textureCache: Map<string, PIXI.Texture> = new Map();

    private static readonly itemDrawers: Record<string, IconDrawer> = {
        blaster: WeaponTextureFactory.drawBlasterIcon,
        plasmaCannon: WeaponTextureFactory.drawPlasmaIcon,
        spreadShot: WeaponTextureFactory.drawSpreadIcon,
        pulseLaser: WeaponTextureFactory.drawLaserIcon,
        rearVulcan: WeaponTextureFactory.drawVulcanIcon,
        sonicBlade: WeaponTextureFactory.drawSonicIcon,
        homingSeeker: WeaponTextureFactory.drawHomingIcon,
        clusterBomb: WeaponTextureFactory.drawClusterIcon,
    };

    /**
     * Retrieves or generates a texture icon for a given weapon ID.
     */
    public static getTexture(app: PIXI.Application, weaponId: string): PIXI.Texture {
        if (this.textureCache.has(weaponId)) {
            return this.textureCache.get(weaponId)!;
        }

        const texture = this.createWeaponTexture(app, weaponId);
        this.textureCache.set(weaponId, texture);
        return texture;
    }

    /**
     * Creates a procedurally drawn weapon pickup icon texture.
     */
    private static createWeaponTexture(app: PIXI.Application, weaponId: string): PIXI.Texture {
        const graphics = new PIXI.Graphics();
        const size = 32;
        const half = size / 2;

        // Base container frame (Glowing Hexagon / Rounded Shield)
        graphics
            .roundRect(0, 0, size, size, 6)
            .fill({ color: 0x111625, alpha: 0.85 })
            .stroke({ width: 2, color: 0x00f0ff, alpha: 0.9 });

        // Delegate drawing to specific method or fallback
        const drawer = this.itemDrawers[weaponId] ?? this.drawDefaultIcon;
        drawer(graphics, half);

        const texture = app.renderer.generateTexture(graphics);
        graphics.destroy();
        return texture;
    }

    private static drawBlasterIcon(g: PIXI.Graphics, half: number): void {
        g.rect(half - 5, half - 8, 3, 16).fill({ color: 0x00ffff });
        g.rect(half + 2, half - 8, 3, 16).fill({ color: 0x00ffff });
    }

    private static drawPlasmaIcon(g: PIXI.Graphics, half: number): void {
        g.circle(half, half, 8).fill({ color: 0xff0088 });
        g.circle(half, half, 4).fill({ color: 0xffffff });
    }

    private static drawSpreadIcon(g: PIXI.Graphics, half: number): void {
        g.moveTo(half, half + 6).lineTo(half - 8, half - 7).stroke({ width: 3, color: 0xffa500 });
        g.moveTo(half, half + 6).lineTo(half, half - 9).stroke({ width: 3, color: 0xffa500 });
        g.moveTo(half, half + 6).lineTo(half + 8, half - 7).stroke({ width: 3, color: 0xffa500 });
    }

    private static drawLaserIcon(g: PIXI.Graphics, half: number): void {
        g.rect(half - 3, half - 10, 6, 20).fill({ color: 0x00e5ff });
        g.rect(half - 1, half - 10, 2, 20).fill({ color: 0xffffff });
    }

    private static drawVulcanIcon(g: PIXI.Graphics, half: number): void {
        g.poly([half - 6, half - 2, half - 2, half - 8, half - 2, half - 2]).fill({ color: 0xffff00 });
        g.poly([half + 2, half - 2, half + 6, half - 8, half + 2, half - 2]).fill({ color: 0xffff00 });
        g.poly([half - 3, half + 2, half + 3, half + 2, half, half + 8]).fill({ color: 0xff4400 });
    }

    private static drawSonicIcon(g: PIXI.Graphics, half: number): void {
        g.arc(half, half + 2, 8, Math.PI * 1.2, Math.PI * 1.8).stroke({ width: 3, color: 0xaa00ff });
    }

    private static drawHomingIcon(g: PIXI.Graphics, half: number): void {
        g.poly([half, half - 9, half + 5, half + 6, half - 5, half + 6]).fill({ color: 0x33ff55 });
    }

    private static drawClusterIcon(g: PIXI.Graphics, half: number): void {
        g.poly([half, half - 8, half + 8, half, half, half + 8, half - 8, half]).fill({ color: 0xff3300 });
        g.circle(half, half, 3).fill({ color: 0xffff00 });
    }

    private static drawDefaultIcon(g: PIXI.Graphics, half: number): void {
        g.rect(half - 2, half - 7, 4, 14).fill({ color: 0xffffff });
        g.rect(half - 7, half - 2, 14, 4).fill({ color: 0xffffff });
    }
}
