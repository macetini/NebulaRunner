import * as PIXI from "pixi.js";
import type { ProjectileSpawnOptions } from "../../weapons/config/ProjectileConfig";

export class HitboxView extends PIXI.Sprite {
    public isEnemy: boolean = false;
    public damage: number = 1;
    public isPiercing: boolean = false;
    public isFrameBound: boolean = false;

    constructor() {
        // PIXI.Texture.WHITE is built into Pixi.js—no app/renderer required!
        super(PIXI.Texture.WHITE);
        this.anchor.set(0.5);
    }

    public setType(isEnemy: boolean): void {
        this.isEnemy = isEnemy;
        this.damage = 1;
        this.isPiercing = false;
        this.isFrameBound = false;
        this.tint = isEnemy ? 0xff0000 : 0x00ff00;
    }

    public configure(options: ProjectileSpawnOptions, isDebug: boolean = false): void {
        this.damage = options.damage ?? 1;
        this.isPiercing = options.extraData?.isPiercing === true;
        this.isFrameBound = options.behavior === "laser_beam" || options.extraData?.isFrameBound === true;

        this.alpha = isDebug ? 0.35 : 0;

        if (options.effect?.width !== undefined) {
            this.width = options.effect.width;
        }
        if (options.effect?.height !== undefined) {
            this.height = options.effect.height;
        }
    }
}
