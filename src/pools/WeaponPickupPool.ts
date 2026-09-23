import * as PIXI from 'pixi.js';
import { WeaponTextureFactory } from '../factories/WeaponDropTextureFactory';
import { WeaponPickupView } from '../views/WeaponPickupView';

export class WeaponPool {
    public readonly activeWeaponPickups: WeaponPickupView[] = [];
    private readonly pool: WeaponPickupView[] = [];
    private readonly app: PIXI.Application;
    private readonly textures = new Map<string, PIXI.Texture>();

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public spawn(x: number, y: number, velocityY: number, weaponId: string): void {
        let texture = this.textures.get(weaponId);
        if (!texture) {
            texture = WeaponTextureFactory.getTexture(this.app, weaponId);
            this.textures.set(weaponId, texture);
        }

        let pickup = this.pool.find((candidate) => !candidate.visible);
        if (!pickup) {
            pickup = new WeaponPickupView(texture, weaponId);
            this.pool.push(pickup);
            this.app.stage.addChild(pickup);
        }

        pickup.setTexture(texture, weaponId);
        pickup.resetPosition(x, y, velocityY);
        this.activeWeaponPickups.push(pickup);
    }

    public recycle(pickup: WeaponPickupView, index: number): void {
        pickup.visible = false;
        this.activeWeaponPickups.splice(index, 1);
    }

    public clear(): void {
        for (const pickup of this.activeWeaponPickups) {
            pickup.visible = false;
        }
        this.activeWeaponPickups.length = 0;
    }
}

export { WeaponPool as WeaponPickupPool };
