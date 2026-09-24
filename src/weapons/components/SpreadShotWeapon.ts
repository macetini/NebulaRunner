import type { ProjectileEmission } from "../../projectiles/ProjectileEmission";
import type { WeaponBalance } from "../../data/types/WeaponBalance";
import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class SpreadShotWeapon implements IPlayerWeapon {
    public readonly id: string;
    private readonly balance: WeaponBalance;

    constructor(balance: WeaponBalance) {
        this.balance = balance;
        this.id = balance.id;
    }

    public fire(context: WeaponFireContext): ProjectileEmission {
        return {
            x: context.x,
            y: context.y,
            options: this.balance.projectile,
        };
    }
}
