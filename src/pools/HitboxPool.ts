import { HitboxSprite } from "../views/combat/HitboxSprite";
import type { ProjectileEmission } from "../projectiles/ProjectileEmission";

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

    public pool(emission: ProjectileEmission): HitboxSprite {
        let hitbox = this.hitBoxView.find((h) => !h.visible);

        if (!hitbox) {
            hitbox = new HitboxSprite();
            this.hitBoxView.push(hitbox);
        }

        hitbox.setType(emission.options.owner === 'enemy');
        hitbox.configure(emission.options, this.showDebugHitboxes);
        hitbox.position.set(emission.x, emission.y);
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
