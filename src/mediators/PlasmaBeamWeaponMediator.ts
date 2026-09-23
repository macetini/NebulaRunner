// src/mediators/PlasmaBeamWeaponMediator.ts
import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import type { SignalBus } from "../core/SignalBus";
import type { PlasmaBeamView } from "../views/PlasmaBeamView";
import type { PlayerView } from "../views/PlayerView";
import type { WeaponSystem } from "../weapons/WeaponSystem";

export class PlasmaBeamWeaponMediator implements IContextItem {
    private readonly view: PlasmaBeamView;
    private readonly signalBus: SignalBus;
    private readonly player: PlayerView;
    private readonly weapons: WeaponSystem;

    constructor(view: PlasmaBeamView, signalBus: SignalBus, player: PlayerView, weapons: WeaponSystem) {
        this.view = view;
        this.signalBus = signalBus;
        this.player = player;
        this.weapons = weapons;

        this.signalBus.addEventListener(GameSignals.PLASMA_BEAM_ACTIVE, this.handleBeamActive);
    }

    private readonly handleBeamActive = (event: Event): void => {
        const detail = (event as CustomEvent<{ x: number; y: number }>).detail;
        if (!detail) return;

        this.view.setBeamActive(true);
        this.view.updateBeam(detail.x, detail.y, 1);
    };

    public update(delta: number): void {
        this.view.update(delta);

        const plasmaCannonEquipped = this.weapons.activeWeaponId === 'plasmaCannon';
        this.view.setBeamActive(plasmaCannonEquipped);

        if (plasmaCannonEquipped) {
            this.view.updateBeam(this.player.x, this.player.y, delta);
        }
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.PLASMA_BEAM_ACTIVE, this.handleBeamActive);
    }
}
