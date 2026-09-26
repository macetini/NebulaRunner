// src/views/combat/WeaponContainerView.ts
import * as PIXI from 'pixi.js';
import type { IWeaponView } from './weaponViews/meta/IWeaponView';

export class WeaponContainerView extends PIXI.Container {
    private readonly views = new Map<string, IWeaponView>();

    constructor() {
        super();
    }

    /**
     * Registers and attaches a shader weapon view to this container layer.
     */
    public registerWeaponView(view: IWeaponView): void {
        this.views.set(view.id, view);
        this.addChild(view);
    }

    /**
     * Retrieves a registered weapon view by its identifier.
     */
    public getWeaponView<T extends IWeaponView>(id: string): T | undefined {
        return this.views.get(id) as T | undefined;
    }

    /**
     * Hides all registered weapon shader views.
     */
    public deactivateAll(): void {
        for (const view of this.views.values()) {
            view.deactivateWeapon();
        }
    }
}
