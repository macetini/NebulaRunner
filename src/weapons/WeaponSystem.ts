import type { IContextItem } from '../core/meta/IContextItem';
import type { ProjectileEmission } from '../projectiles/ProjectileEmission';
import type { IPlayerWeapon } from './meta/IPlayerWeapon';
import { defaultWeaponId, WeaponRegistry } from './WeaponRegistry';

export class WeaponSystem implements IContextItem {

    private readonly registry: WeaponRegistry;
    private activeWeapon: IPlayerWeapon;

    constructor() {
        this.registry = new WeaponRegistry();
        this.activeWeapon = this.registry.get(defaultWeaponId)!;
    }

    public register(weapon: IPlayerWeapon): void {
        this.registry.register(weapon);
        if (this.activeWeapon.id === weapon.id) {
            this.activeWeapon = weapon;
        }
    }

    public equip(weaponId: string): boolean {
        const weapon = this.registry.get(weaponId);
        if (weapon) {
            this.activeWeapon = weapon;
            return true;
        }
        return false;
    }

    public get activeWeaponId(): string {
        return this.activeWeapon.id;
    }

    public fire(x: number, y: number): ProjectileEmission[] {
        return this.activeWeapon.fire({
            x,
            y,
        });
    }

    update(_delta: number): void {
    }
}
