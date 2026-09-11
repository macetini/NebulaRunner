import { GlowFilter } from 'pixi-filters';

export class GlowEffectFactory {
    public static createPlayer(): GlowFilter {
        return this.create({
            color: 0x00FFFF,
            distance: 14,
            outerStrength: 2,
            innerStrength: 0.5,
        });
    }

    public static createProjectile(): GlowFilter {
        return this.create({
            color: 0xFFEE00,
            distance: 8,
            outerStrength: 2,
            innerStrength: 0.5,
        });
    }

    public static createEnemy(color: number): GlowFilter {
        return this.create({
            color,
            distance: 10,
            outerStrength: 1.5,
            innerStrength: 0.35,
        });
    }

    public static createBuff(): GlowFilter {
        return this.create({
            color: 0xFFEE00,
            distance: 12,
            outerStrength: 2,
            innerStrength: 0.5,
        });
    }

    private static create(options: {
        color: number;
        distance: number;
        outerStrength: number;
        innerStrength: number;
    }): GlowFilter {
        return new GlowFilter(options);
    }
}
