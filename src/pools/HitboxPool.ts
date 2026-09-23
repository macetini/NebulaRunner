import type { GameConfig } from "../core/GameConfig";
import { HitboxView } from "../views/combat/HitboxView";
import type { ProjectileSpawnOptions } from "../weapons/config/ProjectileConfig";

export interface BeamHitboxOptions {
    width?: number;
    damage?: number;
    isPiercing?: boolean;
}

export class HitboxPool {
    private readonly config?: GameConfig;
    public readonly activeHitboxes: HitboxView[] = [];
    private readonly pool: HitboxView[] = [];

    constructor(config?: GameConfig) {
        this.config = config;
    }

    public get activeBullets(): HitboxView[] {
        return this.activeHitboxes;
    }

    public spawn(x: number, y: number, isEnemy: boolean = false, options?: ProjectileSpawnOptions): HitboxView {
        let hitbox = this.pool.find((h) => !h.visible);

        if (!hitbox) {
            hitbox = new HitboxView();
            this.pool.push(hitbox);
        }

        hitbox.setType(isEnemy);
        if (options) {
            const isDebug = this.config?.showWeaponHitboxes ?? false;
            hitbox.configure(options, isDebug);
        }
        hitbox.x = x;
        hitbox.y = y;
        hitbox.visible = true;

        this.activeHitboxes.push(hitbox);
        return hitbox;
    }

    public spawnBeamSegment(x: number, y: number, options: BeamHitboxOptions = {}): void {
        const width = options.width ?? 24;
        const damage = options.damage ?? 0.5;
        const step = width * 0.8;

        const spawnOptions: ProjectileSpawnOptions = {
            vx: 0,
            vy: 0,
            damage,
            behavior: "laser_beam",
            effect: {
                shape: "beam",
                color: 0x00ffff,
                radius: width / 2,
                width,
                height: step,
            },
            extraData: {
                isPiercing: options.isPiercing ?? true,
                isShaderWeapon: true,
                isFrameBound: true,
            },
        };

        for (let currentY = y; currentY >= 0; currentY -= step) {
            this.spawn(x, currentY, false, spawnOptions);
        }
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
