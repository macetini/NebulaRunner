export type ProjectileShape = 'capsule' | 'circle' | 'beam' | 'wave' | 'missile';

export type ProjectileBehaviorType =
    | 'straight'
    | 'sinewave'
    | 'homing'
    | 'laser_beam'
    | 'cluster_split';

export type ProjectileRenderEffect = {
    color: number;            // Hex color (e.g. 0x00f0ff)
    glowColor?: number;       // Core or glow aura color
    radius: number;           // Visual/collision radius
    width?: number;           // Width for beams/waves
    height?: number;          // Height for capsules/beams
    trailParticles?: boolean; // Toggles trail particle emission
    shape: ProjectileShape;
};

export type ProjectileSpawnOptions = {
    vx: number;
    vy: number;
    isEnemy?: boolean;
    damage?: number;
    behavior?: ProjectileBehaviorType;
    effect?: ProjectileRenderEffect;
    extraData?: Record<string, unknown>;
};
