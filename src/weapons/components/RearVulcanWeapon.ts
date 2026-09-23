import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class RearVulcanWeapon implements IPlayerWeapon {
    public readonly id = 'rearVulcan';

    fireCooldown: number = 400; // Example cooldown value in milliseconds

    public fire(context: WeaponFireContext): void {
        // Forward twin streams + rear defense bullet
        context.projectiles.spawn(context.x - 8, context.y - 20, false);
        context.projectiles.spawn(context.x + 8, context.y - 20, false);
        context.projectiles.spawn(context.x, context.y + 15, false);
    }
}
