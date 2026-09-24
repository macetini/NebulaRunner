// src/mediators/combat/PlasmaBeamWeaponMediator.ts
import type { IContextItem } from '../../core/meta/IContextItem';
import type { PlasmaBeamView } from '../../views/combat/weaponViews/PlasmaBeamView';
import type { PlayerView } from '../../views/gameplay/PlayerView';
import type { WeaponSystem } from '../../weapons/WeaponSystem';

export class PlasmaBeamMediator implements IContextItem {
    private readonly view: PlasmaBeamView;
    private readonly playerView: PlayerView;
    private readonly weaponSystem: WeaponSystem;

    constructor(view: PlasmaBeamView, playerView: PlayerView, weaponSystem: WeaponSystem) {
        this.view = view;
        this.playerView = playerView;
        this.weaponSystem = weaponSystem;
    }

    public update(delta: number): void {
        this.view.setWeaponActive(this.weaponSystem.activeWeaponId === 'plasma_beam');

        // Continuously attach shader mesh coordinates to the ship position
        this.view.updateWeapon({ x: this.playerView.x, y: this.playerView.y }, delta);
    }

    public destroy(): void {
        this.view.setWeaponActive(false);
    }
}
