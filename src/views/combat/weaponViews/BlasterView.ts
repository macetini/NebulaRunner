// src/views/combat/weaponViews/BlasterView.ts

import { AbstractWeaponView, type WeaponTransform } from './AbstractWeaponView';

export class BlasterView extends AbstractWeaponView {
    private currentHeight: number;

    constructor(screenHeight: number) {
        super();
        this.currentHeight = screenHeight;

    }

    public override update(delta: number): void {
        super.update(delta);
    }

    public updateWeapon(transform: WeaponTransform): void {
    }
}
