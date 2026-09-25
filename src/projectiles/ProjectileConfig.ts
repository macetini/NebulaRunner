export type ProjectileBehaviorType =
    | 'straight'
    | 'beam'
    | 'homing'
    | 'sinewave'
    | 'wave'             // Added to match sonicBlade
    | 'spread'           // Added to match spreadShot
    | 'directional'      // Added to match rearVulcan
    | 'explosive'        // Added to match clusterBomb
    | 'cluster_split';

export type ProjectileOwner = 'player' | 'enemy';

/**
 * Options used when spawning a projectile.
 */
export type ProjectileSpawnOptions = {
    vx?: number;                            // Horizontal velocity. Positive = right, negative = left. (Optional - not required for all 'beam' types)
    vy?: number;                            // Vertical velocity. Positive = down, negative = up. (Optional - not required for all 'beam' types)
    width: number;                          // Projectile width in pixels.
    height?: number;                        // Projectile height in pixels. (Optional - Not required for 'beam' projectiles)
    owner: ProjectileOwner;                 // Projectile faction. Controls collision targets and movement direction.
    behavior: ProjectileBehaviorType;       // Examples: straight, homing, beam, cluster_split.
};
