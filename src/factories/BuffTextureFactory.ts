import * as PIXI from 'pixi.js';

export function generateShieldTexture(app: PIXI.Application): PIXI.Texture {
    const graphics = new PIXI.Graphics();

    graphics
        .poly([0, -22, 16, -15, 16, 7, 10, 16, 0, 23, -10, 16, -16, 7, -16, -15])
        .fill(0x0088FF)
        .stroke({ width: 2, color: 0xFFFFFF });

    graphics
        .poly([0, -16, 11, -11, 11, 5, 6, 12, 0, 17, -6, 12, -11, 5, -11, -11])
        .fill(0x00E5FF);

    graphics
        .poly([-2, -11, 2, -11, 2, -2, 10, -2, 10, 2, 2, 2, 2, 11, -2, 11, -2, 2, -10, 2, -10, -2, -2, -2])
        .fill(0xFFFFFF);

    graphics
        .poly([-11, -12, 0, -17, 11, -12, 11, -6, -11, -6])
        .fill({ color: 0xFFFFFF, alpha: 0.3 });

    return app.renderer.generateTexture(graphics);
}
