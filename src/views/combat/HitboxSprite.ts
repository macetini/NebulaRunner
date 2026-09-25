import * as PIXI from "pixi.js";
import type { ProjectileState } from "../../projectiles/type/ProjectileState";

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

    public configure(state: ProjectileState, isDebug: boolean = false): void {
        this.damage = state.damage;
        this.isBeam = state.behavior === "beam";
        this.isPiercing = state.isPiercing;

        this.width = state.width;
        this.height = state.height;

        this.alpha = isDebug ? 0.7 : 0;
    }
}
