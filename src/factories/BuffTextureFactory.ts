import * as PIXI from 'pixi.js';

export function generateRapidFireTexture(app: PIXI.Application): PIXI.Texture {
    const graphics = new PIXI.Graphics();

    // 1. Dark Rotary Barrel Housing
    graphics
        .circle(0, 0, 15)
        .fill(0x1A1A1A)
        .stroke({ width: 2, color: 0xFFCC00 });

    // 2. Six Circular Barrel Chambers
    const barrels = 6;
    const radius = 8;
    for (let i = 0; i < barrels; i++) {
        const angle = (i / barrels) * Math.PI * 2;
        const bx = Math.cos(angle) * radius;
        const by = Math.sin(angle) * radius;

        graphics
            .circle(bx, by, 3)
            .fill(0xFF6600)
            .stroke({ width: 1, color: 0xFFFFFF });
    }

    // 3. Bright Muzzle Flash Core
    graphics
        .circle(0, 0, 4)
        .fill(0xFFFF00)
        .circle(0, 0, 2)
        .fill(0xFFFFFF);

    return app.renderer.generateTexture(graphics);
}

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

export function generateExplosionTexture(app: PIXI.Application): PIXI.Texture {
    const graphics = new PIXI.Graphics();

    // 1. Rhombus / Diamond Blast Frame
    graphics
        .poly([0, -18, 18, 0, 0, 18, -18, 0])
        .fill(0xE65100)
        .stroke({ width: 2, color: 0xFFD54F });

    // 2. Rotated Secondary Diamond (8-Point Flare)
    graphics
        .poly([0, -12, 12, 0, 0, 12, -12, 0])
        .fill(0xFF9800);

    // 3. Diagonal Burst Lines
    graphics
        .poly([0, -22, 4, -4, 22, 0, 4, 4, 0, 22, -4, 4, -22, 0, -4, -4])
        .fill(0xFFEB3B);

    // 4. White Supernova Center
    graphics
        .circle(0, 0, 5)
        .fill(0xFFFFFF);

    return app.renderer.generateTexture(graphics);
}
