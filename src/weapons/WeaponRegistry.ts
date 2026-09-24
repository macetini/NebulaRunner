import type { WeaponBalance } from '../data/types/WeaponBalance';
import { BlasterWeapon } from './components/BlasterWeapon';
import { ClusterBombWeapon } from './components/ClusterBombWeapon';
import { HomingSeekerWeapon } from './components/HomingSeekerWeapon';
import { PlasmaBeamWeapon } from './components/PlasmaBeamWeapon';
import { PulseLaserWeapon } from './components/PulseLaserWeapon';
import { RearVulcanWeapon } from './components/RearVulcanWeapon';
import { SonicBladeWeapon } from './components/SonicBladeWeapon';
import { SpreadShotWeapon } from './components/SpreadShotWeapon';
import type { IPlayerWeapon } from './meta/IPlayerWeapon';

export const defaultWeaponId = 'plasma_beam';  // Put this in config

// Class constructor interface
type WeaponConstructor = new (balance: WeaponBalance) => IPlayerWeapon;

// Directly map ID strings to Weapon Class constructors
const weaponConstructors: Record<string, WeaponConstructor> = {
    blaster: BlasterWeapon,
    plasma_beam: PlasmaBeamWeapon,
    spreadShot: SpreadShotWeapon,
    pulseLaser: PulseLaserWeapon,
    rearVulcan: RearVulcanWeapon,
    sonicBlade: SonicBladeWeapon,
    homingSeeker: HomingSeekerWeapon,
    clusterBomb: ClusterBombWeapon,
};

export class WeaponRegistry {
    private readonly weapons = new Map<string, IPlayerWeapon>();

    constructor(weaponsBalance: WeaponBalance[]) {
        for (const balance of weaponsBalance) {
            const WeaponClass = weaponConstructors[balance.id];
            if (!WeaponClass) {
                console.warn(`[WeaponRegistry] Unknown weapon ID: "${balance.id}"`);
                continue;
            }
            // Dynamically instantiate with 'new'
            this.register(new WeaponClass(balance));
        }
    }

    public register(weapon: IPlayerWeapon): void {
        this.weapons.set(weapon.id, weapon);
    }

    public get(id: string): IPlayerWeapon | undefined {
        return this.weapons.get(id);
    }

    public has(id: string): boolean {
        return this.weapons.has(id);
    }

    public getAll(): IPlayerWeapon[] {
        return Array.from(this.weapons.values());
    }
}
