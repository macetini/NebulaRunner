import type { ProjectileState } from "../projectiles/type/ProjectileState";
import { HitboxSprite } from "../views/combat/HitboxSprite";

export interface BeamHitboxOptions {
    width?: number;
    damage?: number;
    isPiercing?: boolean;
}

export class HitboxPool {
    public readonly activeHitboxes: HitboxSprite[] = [];
    private readonly hitBoxView: HitboxSprite[] = [];
    private readonly showDebugHitboxes: boolean;

    constructor(showDebugHitboxes: boolean = false) {
        this.showDebugHitboxes = showDebugHitboxes;
    }

    public get getActive(): HitboxSprite[] {
        return this.activeHitboxes;
    }

    // 💡 Update parameter type from ProjectileEmission to ProjectileState
    public pool(state: ProjectileState): HitboxSprite {
        let hitbox = this.hitBoxView.find((h) => !h.visible);

        if (!hitbox) {
            hitbox = new HitboxSprite();
            this.hitBoxView.push(hitbox);
        }

        // 💡 Read clean properties directly from runtime state
        hitbox.setType(state.owner === 'enemy');
        hitbox.configure(state, this.showDebugHitboxes);
        hitbox.position.set(state.x, state.y);
        hitbox.visible = true;

        this.activeHitboxes.push(hitbox);
        return hitbox;
    }

    public recycle(hitbox: HitboxSprite, index: number): void {
        hitbox.visible = false;
        this.activeHitboxes.splice(index, 1);
    }

    public clear(): void {
        for (let i = 0; i < this.activeHitboxes.length; i++) {
            this.activeHitboxes[i].visible = false;
        }
        this.activeHitboxes.length = 0;
    }
}
