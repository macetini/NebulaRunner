import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class ClusterBombWeapon implements IPlayerWeapon {
    public readonly id = 'clusterBomb';

    fireCooldown: number = 600; // Example cooldown value in milliseconds

    public fire(context: WeaponFireContext): void {
        context.hitboxPool.spawn(context.x, context.y - 22, false);
    }
}
