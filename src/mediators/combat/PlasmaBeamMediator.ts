// src/mediators/combat/PlasmaBeamWeaponMediator.ts
import type { IContextItem } from '../../core/context/meta/IContextItem';
import type { SignalBus } from '../../core/game/SignalBus';
import type { PlasmaBeamView } from '../../views/combat/weaponViews/PlasmaBeamView';

export class PlasmaBeamMediator implements IContextItem {
    private readonly view: PlasmaBeamView;
    private readonly signalBus: SignalBus;

    constructor(view: PlasmaBeamView, signalBus: SignalBus) {
        this.view = view;
        this.signalBus = signalBus;
    }

    public update(_delta: number): void {

    }

    public destroy(): void {
        this.view.deactivateWeapon();
    }
}
