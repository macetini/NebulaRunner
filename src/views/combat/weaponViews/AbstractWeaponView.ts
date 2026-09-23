import * as PIXI from "pixi.js";

export interface WeaponTransform {
    x: number;
    y: number;
    targetX?: number;
    targetY?: number;
    angle?: number;
}

export abstract class AbstractWeaponView extends PIXI.Container {
    protected time: number = 0;

    constructor() {
        super();
        this.visible = false;
    }

    /**
     * Toggles visibility of the shader view.
     * Override if custom fade-in/fade-out behavior is needed.
     */
    public setWeaponActive(active: boolean): void {
        this.visible = active;
    }

    /**
     * Called on tick to update shader uniforms like uTime.
     */
    public update(delta: number): void {
        if (!this.visible) return;
        this.time += delta / 60;
    }

    /**
     * Must be implemented by subclasses to update mesh geometry,
     * uniforms, and ship attachment coordinates.
     */
    public abstract updateWeapon(transform: WeaponTransform, delta: number): void;
}
