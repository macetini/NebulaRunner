import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class HomingSeekerWeapon implements IPlayerWeapon {
    public readonly id = 'homingSeeker';

    fireCooldown: number = 450; // Example cooldown value in milliseconds

    public fire(context: WeaponFireContext): void {
        context.projectilePool.spawn(context.x - 15, context.y - 10, false);
        context.projectilePool.spawn(context.x + 15, context.y - 10, false);
    }
}
