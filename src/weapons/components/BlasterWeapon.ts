import type { ProjectileEmission } from "../../projectiles/ProjectileEmission";
import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class BlasterWeapon implements IPlayerWeapon {
    public readonly id: string = 'blaster';
    public readonly fireCooldown = 8;

    public fire(context: WeaponFireContext): ProjectileEmission[] {
        return [{
            x: context.x,
            y: context.y,
            options: {
                vx: 0,
                vy: -30,
                projectileId: this.id,
                owner: "player",
                behavior: "beam",
            },
        }];
    }
}
