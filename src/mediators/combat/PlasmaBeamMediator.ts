// src/mediators/combat/PlasmaBeamWeaponMediator.ts
import type { IContextItem } from '../../core/meta/IContextItem';
import type { PlasmaBeamView } from '../../views/combat/weaponViews/PlasmaBeamView';
import type { PlayerView } from '../../views/gameplay/PlayerView';

export class PlasmaBeamMediator implements IContextItem {
    private readonly view: PlasmaBeamView;
    private readonly playerView: PlayerView;

    constructor(view: PlasmaBeamView, playerView: PlayerView) {
        this.view = view;
        this.playerView = playerView;

        this.view.setWeaponActive(false);
    }

    public update(delta: number): void {
        // Continuously attach shader mesh coordinates to the ship position
        this.view.updateWeapon({ x: this.playerView.x, y: this.playerView.y }, delta);
    }

    public destroy(): void {
        this.view.setWeaponActive(false);
    }
}
