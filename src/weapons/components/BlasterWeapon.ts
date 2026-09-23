import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class BlasterWeapon implements IPlayerWeapon {
    public readonly id: string = 'blaster';
    public readonly fireCooldown = 8;

    public fire(ctx: WeaponFireContext): void {
        ctx.projectilePool.spawn(ctx.x, ctx.y - 20);
    }
}
