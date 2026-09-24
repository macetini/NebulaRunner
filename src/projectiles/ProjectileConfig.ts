export type ProjectileShape = 'capsule' | 'circle' | 'beam' | 'wave' | 'missile';

export type ProjectileBehaviorType =
    | 'straight'
    | 'sinewave'
    | 'homing'
    | 'beam'
    | 'cluster_split';

export type ProjectileOwner = 'player' | 'enemy';

/**
 * Options used when spawning a projectile.
 */
export type ProjectileSpawnOptions = {
    vx: number;                             // Horizontal velocity. Positive = right, negative = left.
    vy: number;                             // Vertical velocity. Positive = down, negative = up.
    projectileId: string;                   // Optional balance/config ID used to resolve projectile data.
    owner: ProjectileOwner;                 // Projectile faction. Controls collision targets and movement direction.
    behavior: ProjectileBehaviorType;       // Examples: straight, homing, beam, cluster_split.
};
