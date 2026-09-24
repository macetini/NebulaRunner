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

type WeaponFactory = (balance: WeaponBalance) => IPlayerWeapon;

const weaponFactories = new Map<string, WeaponFactory>([
    ['blaster', (balance) => new BlasterWeapon(balance)],
    ['plasma_beam', (balance) => new PlasmaBeamWeapon(balance)],
    ['spreadShot', (balance) => new SpreadShotWeapon(balance)],
    ['pulseLaser', (balance) => new PulseLaserWeapon(balance)],
    ['rearVulcan', (balance) => new RearVulcanWeapon(balance)],
    ['sonicBlade', (balance) => new SonicBladeWeapon(balance)],
    ['homingSeeker', (balance) => new HomingSeekerWeapon(balance)],
    ['clusterBomb', (balance) => new ClusterBombWeapon(balance)],
]);

export class WeaponRegistry {
    private readonly weapons = new Map<string, IPlayerWeapon>();

    constructor(weapons: WeaponBalance[]) {
        for (const weapon of weapons) {
            const factory = weaponFactories.get(weapon.id);
            if (!factory) {
                throw new Error(`Unknown weapon balance ID: ${weapon.id}`);
            }

            const weaponInstance = factory(weapon);
            this.register(weaponInstance);
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
