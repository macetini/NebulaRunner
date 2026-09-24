import type { ProjectileEmission } from '../../projectiles/ProjectileEmission';

export type WeaponFireContext = {
    x: number;
    y: number;
};

export interface IPlayerWeapon {
    readonly id: string;
    fire(context: WeaponFireContext): ProjectileEmission[];
}
