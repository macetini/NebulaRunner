import { HitboxView } from "../views/combat/HitboxView";
import type { ProjectileEmission } from "../projectiles/ProjectileEmission";

export interface BeamHitboxOptions {
    width?: number;
    damage?: number;
    isPiercing?: boolean;
}

export class HitboxPool {
    public readonly activeHitboxes: HitboxView[] = [];
    private readonly hitBoxView: HitboxView[] = [];
    private readonly showDebugHitboxes: boolean;

    constructor(showDebugHitboxes: boolean = false) {
        this.showDebugHitboxes = showDebugHitboxes;
    }

    public get activeBullets(): HitboxView[] {
        return this.activeHitboxes;
    }

    public pool(emission: ProjectileEmission): HitboxView {
        let hitbox = this.hitBoxView.find((h) => !h.visible);

        if (!hitbox) {
            hitbox = new HitboxView();
            this.hitBoxView.push(hitbox);
        }

        hitbox.setType(emission.options.owner === "enemy");
        hitbox.configure(emission.options, this.showDebugHitboxes);
        hitbox.position.set(emission.x, emission.y);
        hitbox.visible = true;
        this.activeHitboxes.push(hitbox);
        return hitbox;
    }

    public recycleFrameBoundHitboxes(): void {
        for (let i = this.activeHitboxes.length - 1; i >= 0; i--) {
            const hitbox = this.activeHitboxes[i];
            if (hitbox.isFrameBound) {
                hitbox.visible = false;
                hitbox.isFrameBound = false;
                this.activeHitboxes.splice(i, 1);
            }
        }
    }

    public recycleBeamSegments(): void {
        this.recycleFrameBoundHitboxes();
    }

    public recycle(hitbox: HitboxView, index: number): void {
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
