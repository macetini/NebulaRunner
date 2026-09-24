import type { ProjectileEmission } from "../../projectiles/ProjectileEmission";
import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class PulseLaserWeapon implements IPlayerWeapon {
    public readonly id = 'pulseLaser';

    fireCooldown: number = 300; // Example cooldown value in milliseconds

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
