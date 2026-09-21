import * as PIXI from 'pixi.js';

export class PlayerTextureFactory {
    public static createPlayerTexture(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();

        // 1. Base Wing Structure
        g.poly([0, -20, 22, 18, 10, 12, 0, 18, -10, 12, -22, 18])
            .fill(0x11111A)
            .stroke({ width: 2, color: 0x444455 });

        // 2. Forward Fuselage / Arrowhead
        g.poly([0, -37, 12, 10, 0, 6, -12, 10])
            .fill(0x222233)
            .stroke({ width: 2, color: 0x00FFFF });

        // 3. Cyber Cockpit
        g.poly([0, -15, 3, -3, -3, -3])
            .fill(0xFFFFFF);

        return app.renderer.generateTexture(g);
    }
}
