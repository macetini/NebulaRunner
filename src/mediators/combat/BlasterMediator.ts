// src/mediators/combat/BlasterMediator.ts
import type { IContextItem } from '../../core/context/meta/IContextItem';
import { GameSignals } from '../../core/game/GameSignals';
import type { SignalBus } from '../../core/game/SignalBus';
import type { BlasterView } from '../../views/combat/weaponViews/BlasterView';

export class BlasterMediator implements IContextItem {
    private readonly view: BlasterView;
    private readonly signalBus: SignalBus;

    constructor(view: BlasterView, signalBus: SignalBus) {
        this.view = view;
        this.signalBus = signalBus;

        this.signalBus.addEventListener(GameSignals.PLAYER_MOVED, this.handlePlayerMoved);
        this.signalBus.addEventListener(GameSignals.WEAPON_EQUIPPED, this.handleWeaponEquipped);
    }

    private readonly handlePlayerMoved = (event: Event): void => {
        const customEvent = event as CustomEvent<{ x: number; y: number }>;
        const { x, y } = customEvent.detail;
        this.view.setMuzzlePosition(x, y);
    };

    private readonly handleWeaponEquipped = (event: Event): void => {
        const customEvent = event as CustomEvent<{ weaponId: string }>;
        const weaponId = customEvent.detail.weaponId;

        if (weaponId === this.view.id) {
            this.view.activateWeapon();
        } else {
            this.view.deactivateWeapon();
        }
    };

    public update(delta: number): void {
        this.view.update(delta);
    }

    public destroy(): void {
        this.view.deactivateWeapon();

        this.signalBus.removeEventListener(GameSignals.WEAPON_EQUIPPED, this.handleWeaponEquipped);
        this.signalBus.removeEventListener(GameSignals.PLAYER_MOVED, this.handlePlayerMoved);
    }
}
