import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class SpreadShotWeapon implements IPlayerWeapon {
    public readonly id = 'spreadShot';

    fireCooldown: number = 500;

    public fire(context: WeaponFireContext): void {
        // Angled 3-way spread fan
        context.hitboxPool.spawn(context.x - 12, context.y - 20, false);
        context.hitboxPool.spawn(context.x, context.y - 25, false);
        context.hitboxPool.spawn(context.x + 12, context.y - 20, false);
    }
}
