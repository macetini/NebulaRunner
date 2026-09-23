// src/views/combat/WeaponContainerView.ts
import * as PIXI from 'pixi.js';
import type { AbstractWeaponView } from './weaponViews/AbstractWeaponView';

export class WeaponContainerView extends PIXI.Container {
    private readonly views = new Map<string, AbstractWeaponView>();

    /**
     * Registers and attaches a shader weapon view to this container layer.
     */
    public registerWeaponView(id: string, view: AbstractWeaponView): void {
        this.views.set(id, view);
        this.addChild(view);
    }

    /**
     * Retrieves a registered weapon view by its identifier.
     */
    public getWeaponView<T extends AbstractWeaponView>(id: string): T | undefined {
        return this.views.get(id) as T | undefined;
    }

    /**
     * Advances uTime/animation state for all active weapon views.
     */
    public update(delta: number): void {
        for (const view of this.views.values()) {
            if (view.visible) {
                view.update(delta);
            }
        }
    }

    /**
     * Hides all registered weapon shader views.
     */
    public deactivateAll(): void {
        for (const view of this.views.values()) {
            view.setWeaponActive(false);
        }
    }
}
