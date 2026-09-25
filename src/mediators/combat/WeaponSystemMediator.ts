import type { IContextItem } from "../../core/context/meta/IContextItem";
import { gameConfig } from "../../core/game/GameConfig";
import { GameSignals } from "../../core/game/GameSignals";
import type { SignalBus } from "../../core/game/SignalBus";
import type { WeaponSystem } from "../../weapons/WeaponSystem";

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
        this.weapons.equip(gameConfig.playerDefaultWeaponId);
    };

    /**
     * Handles weapon acquisition. Equips the new weapon if it exists.
     */
    private readonly handleWeaponPickup = (event: Event): void => {
        const { weaponId } = (event as CustomEvent<{ weaponId?: string }>).detail ?? {};

        if (typeof weaponId === 'string' && weaponId.length > 0) {
            //this.weapons.equip(weaponId);
        }
    };

    public update(_delta: number): void {
    }
}
