// src/pools/BlasterPool.ts
import * as PIXI from 'pixi.js';
import { BlasterView } from '../views/combat/weaponViews/BlasterView';

export class BlasterPool {
    public readonly activeBlasters: BlasterView[] = [];
    private readonly pool: BlasterView[] = [];
    private readonly app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    /**
     * Spawns a BlasterView from the pool or creates a new one if all are in use.
     * @param x Initial X coordinate (e.g., player's muzzle X)
     * @param y Initial Y coordinate (e.g., player's muzzle Y)
     */
    public spawn(x: number, y: number): BlasterView {
        // Find an available inactive blaster
        let blaster = this.pool.find((candidate) => !candidate.visible);

        if (!blaster) {

            // Instantiate a new one using the screen height for the shader scale
            blaster = new BlasterView(this.app.screen.height);
            this.pool.push(blaster);
            this.app.stage.addChild(blaster);
        }

        // Activate and position it
        blaster.visible = true;
        blaster.updateWeapon({ x, y });

        this.activeBlasters.push(blaster);

        return blaster;
    }

    /**
     * Returns a BlasterView to the inactive pool.
     */
    public recycle(blaster: BlasterView, index: number): void {

        blaster.visible = false;
        this.activeBlasters.splice(index, 1);
    }

    /**
     * Hides and recycles all currently active blasters.
     */
    public clear(): void {

        for (const blaster of this.activeBlasters) {

            blaster.visible = false;
        }
        this.activeBlasters.length = 0;
    }
}
