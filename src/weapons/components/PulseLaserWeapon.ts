import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class PulseLaserWeapon implements IPlayerWeapon {
    public readonly id = 'pulseLaser';

    fireCooldown: number = 300; // Example cooldown value in milliseconds

    public fire(context: WeaponFireContext): void {
        context.projectilePool.spawn(context.x, context.y - 30, false);
    }
}
