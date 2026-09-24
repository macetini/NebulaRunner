import * as PIXI from "pixi.js";
import type { ProjectileSpawnOptions } from "../../projectiles/ProjectileConfig";

export class HitboxSprite extends PIXI.Sprite {
    public isEnemy: boolean = false;
    public damage: number = 1;
    public isPiercing: boolean = false;
    public isBeam: boolean = false;

    constructor() {
        // PIXI.Texture.WHITE is built into Pixi.js—no app/renderer required!
        super(PIXI.Texture.WHITE);
        this.anchor.set(0.5);
    }

    public setType(isEnemy: boolean): void {
        this.isEnemy = isEnemy;
        this.tint = isEnemy ? 0xff0000 : 0x00ff00;
    }

    public configure(options: ProjectileSpawnOptions, isDebug: boolean = false): void {
        this.damage = 1;
        this.isBeam = options.behavior === "beam";
        this.isPiercing = options.behavior === "beam";
        this.width = options.width;
        this.height = options.height ?? 1;
        this.alpha = isDebug ? 0.7 : 0;
    }
}
