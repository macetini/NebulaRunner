// src/mediators/PlasmaBeamWeaponMediator.ts
import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import type { SignalBus } from "../core/SignalBus";
import type { PlasmaBeamView } from "../views/PlasmaBeamView";

export class PlasmaBeamWeaponMediator implements IContextItem {
    private readonly view: PlasmaBeamView;
    private readonly signalBus: SignalBus;
    private beamActiveThisFrame = false;

    constructor(view: PlasmaBeamView, signalBus: SignalBus) {
        this.view = view;
        this.signalBus = signalBus;

        this.signalBus.addEventListener(GameSignals.PLASMA_BEAM_ACTIVE, this.handleBeamActive);
    }

    private readonly handleBeamActive = (event: Event): void => {
        const detail = (event as CustomEvent<{ x: number; y: number }>).detail;
        if (!detail) return;

        this.beamActiveThisFrame = true;
        this.view.setBeamActive(true);
        this.view.updateBeam(detail.x, detail.y, 1);
    };

    public update(delta: number): void {
        this.view.update(delta);

        // Turn off view if weapon stopped firing this tick
        if (!this.beamActiveThisFrame) {
            this.view.setBeamActive(false);
        }
        this.beamActiveThisFrame = false;
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.PLASMA_BEAM_ACTIVE, this.handleBeamActive);
    }
}
