import { BlasterWeapon } from './components/BlasterWeapon';
import { ClusterBombWeapon } from './components/ClusterBombWeapon';
import { HomingSeekerWeapon } from './components/HomingSeekerWeapon';
import { PlasmaBeamWeapon } from './components/PlasmaBeamWeapon';
import { PulseLaserWeapon } from './components/PulseLaserWeapon';
import { RearVulcanWeapon } from './components/RearVulcanWeapon';
import { SonicBladeWeapon } from './components/SonicBladeWeapon';
import { SpreadShotWeapon } from './components/SpreadShotWeapon';
import type { IPlayerWeapon } from './meta/IPlayerWeapon';

export const defaultWeaponId = 'plasma_beam';

export class WeaponRegistry {
    private readonly weapons = new Map<string, IPlayerWeapon>();

    constructor() {
        this.register(new BlasterWeapon());
        this.register(new PlasmaBeamWeapon());
        this.register(new SpreadShotWeapon());
        this.register(new PulseLaserWeapon());
        this.register(new RearVulcanWeapon());
        this.register(new SonicBladeWeapon());
        this.register(new HomingSeekerWeapon());
        this.register(new ClusterBombWeapon());
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
