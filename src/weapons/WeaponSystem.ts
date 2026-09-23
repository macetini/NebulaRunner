import type { SignalBus } from '../core/SignalBus';
import type { HitboxPool } from '../pools/HitboxPool';
import type { IPlayerWeapon } from './meta/IPlayerWeapon';
import { defaultWeaponId, WeaponRegistry } from './WeaponRegistry';

export class WeaponSystem {
    private readonly projectiles: HitboxPool;
    private readonly signalBus: SignalBus;
    private readonly registry: WeaponRegistry;
    private activeWeapon: IPlayerWeapon;

    constructor(projectiles: HitboxPool, signalBus: SignalBus) {
        this.projectiles = projectiles;
        this.signalBus = signalBus;
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

    public fire(x: number, y: number): void {
        this.activeWeapon.fire({
            x,
            y,
            hitboxPool: this.projectiles,
            signalBus: this.signalBus,
        });
    }
}
