import type { ProjectileBehaviorType, ProjectileOwner } from "../ProjectileConfig";

export type ProjectileState = {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    damage: number;
    isPiercing: boolean;
    owner: ProjectileOwner;
    behavior: ProjectileBehaviorType;
};
