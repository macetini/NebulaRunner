import type { IContextItem } from "../../core/meta/IContextItem";
import type { SignalBus } from "../../core/SignalBus";
import type { WeaponSystem } from "../../weapons/WeaponSystem";
import { GameSignals } from "../../core/GameSignals";
import { defaultWeaponId } from "../../weapons/WeaponRegistry";

export class WeaponSystemMediator implements IContextItem {
    private readonly weapons: WeaponSystem;
    private readonly signalBus: SignalBus;

    constructor(weapons: WeaponSystem, signalBus: SignalBus) {
        this.weapons = weapons;
        this.signalBus = signalBus;

        this.signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.handleRestart);
        this.signalBus.addEventListener(GameSignals.WEAPON_PICKED_UP, this.handleWeaponPickup);
    }

    private readonly handleRestart = (): void => {
        this.weapons.equip(defaultWeaponId);
    };

    /**
     * Handles weapon acquisition. Equips the new weapon if it exists.
     */
    private readonly handleWeaponPickup = (event: Event): void => {
        const { weaponId } = (event as CustomEvent<{ weaponId?: string }>).detail ?? {};

        if (typeof weaponId === 'string' && weaponId.length > 0) {
            this.weapons.equip(weaponId);
        }
    };

    public update(_delta: number): void {
    }
}
