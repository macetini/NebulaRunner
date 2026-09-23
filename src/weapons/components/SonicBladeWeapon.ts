import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class SonicBladeWeapon implements IPlayerWeapon {
    public readonly id = 'sonicBlade';

    fireCooldown: number = 350; // Example cooldown value in milliseconds

    public fire(context: WeaponFireContext): void {
        context.hitboxPool.spawn(context.x, context.y - 20, false);
    }
}
