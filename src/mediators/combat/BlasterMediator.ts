// src/mediators/combat/PlasmaBeamWeaponMediator.ts
import type { IContextItem } from '../../core/context/meta/IContextItem';
import type { BlasterView } from '../../views/combat/weaponViews/BlasterView';
import type { PlayerView } from '../../views/gameplay/PlayerView';
import type { WeaponSystem } from '../../weapons/WeaponSystem';

export class BlasterMediator implements IContextItem {
    private readonly view: BlasterView;
    private readonly playerView: PlayerView;
    private readonly weaponSystem: WeaponSystem;

    constructor(view: BlasterView, playerView: PlayerView, weaponSystem: WeaponSystem) {
        this.view = view;
        this.playerView = playerView;
        this.weaponSystem = weaponSystem;
    }

    public update(_delta: number): void {
        this.view.setWeaponActive(this.weaponSystem.activeWeaponId === 'blaster');

        // Continuously attach shader mesh coordinates to the ship position
        this.view.updateWeapon(
            {
                x: this.playerView.x,
                y: this.playerView.muzzleY,
            }
        );
    }

    public destroy(): void {
        this.view.setWeaponActive(false);
    }
}
