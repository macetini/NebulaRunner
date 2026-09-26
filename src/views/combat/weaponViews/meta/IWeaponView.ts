import * as PIXI from "pixi.js";

export interface IWeaponView extends PIXI.Container {
    id: string;

    time: number;

    /**
     * Toggles visibility of the shader view.
     * Override if custom fade-in/fade-out behavior is needed.
     */
    activateWeapon(): void;

    /**
     * Hides the shader view.
     * Override if custom fade-out behavior is needed.
     */
    deactivateWeapon(): void;

    /**
     * Called on tick to update shader uniforms like uTime.
     */
    update(delta: number): void;
}
