export type GameConfig = {
    godMode: boolean;
    showPerformanceStats: boolean;
    playerInitialY: number;
    playerSpeed: number;
    boostDuration: number;
    boostMaximumCharge: number;
    boostChargePerEnemy: number;
    boostDistance: number;
    boostSpeedMultiplier: number;
    enemySpeed: number;
    enemySineOscillationSpeed: number;
    enemySineOscillationAmplitude: number;
    enemyChaseSpeed: number;
    armoredEnemyHealth: number;
    enemySpawnInterval: number;
    enemyMinimumSpawnInterval: number;
    enemySpawnIntervalDecreasePerSecond: number;
    enemySpeedIncreasePerSecond: number;
    enemyMaximumSpeedIncrease: number;
    staticBoxSpawnInterval: number;
    staticBoxMaximumOnScreen: number;
    staticBoxSmallScore: number;
    staticBoxMediumScore: number;
    staticBoxLargeScore: number;
    projectileSpeed: number;
    fireCooldown: number;
    collisionDistance: number;
    backgroundSpeed: number;

    // Star movement distance marks
    levelDistanceInterval: number;
    starAppearDistance: number;
    starLeaveDistance: number;
    starTravelDistance: number;
    starTransformDistance: number;

    particleCountPerExplosion: number;
    particleMinLifetime: number;
    particleMaxLifetime: number;
    particleMinSpeed: number;
    particleMaxSpeed: number;
    buffDropChance: number;
    buffFallSpeed: number;
    buffMagnetRadius: number;
    buffMagnetSpeed: number;
    enemyProjectileSpeed: number;
    enemyShootingRange: number;
    enemyFireCooldown: number;
    rapidFireCooldown: number;
    rapidFireDuration: number;
    shieldDuration: number;
};

export const gameConfig: GameConfig = {
    // Dev
    godMode: true,
    showPerformanceStats: true,

    // Player Settings
    playerInitialY: 610,
    playerSpeed: 6,
    boostDuration: 36,
    boostMaximumCharge: 100,
    boostChargePerEnemy: 20,
    boostDistance: 140,
    boostSpeedMultiplier: 2.5,

    // Enemy Settings
    enemySpeed: 4,
    enemySineOscillationSpeed: 0.1,
    enemySineOscillationAmplitude: 10,
    enemyChaseSpeed: 1.5,
    armoredEnemyHealth: 3,
    enemySpawnInterval: 100,
    enemyMinimumSpawnInterval: 35,
    enemySpawnIntervalDecreasePerSecond: 1.5,
    enemySpeedIncreasePerSecond: 0.02,
    enemyMaximumSpeedIncrease: 0.75,
    staticBoxSpawnInterval: 180,
    staticBoxMaximumOnScreen: 3,
    staticBoxSmallScore: 1,
    staticBoxMediumScore: 3,
    staticBoxLargeScore: 6,

    // Projectile Settings
    projectileSpeed: 12,
    fireCooldown: 10,
    collisionDistance: 25,
    backgroundSpeed: 3,

    // Star movement distance marks
    levelDistanceInterval: 100.0, // Repeat the sequence after this traveled distance.

    starAppearDistance: 10.0,       // (enter) Start entering from above at this distance.
    starLeaveDistance: 20.0,        // (hold) Start transforming at this distance.
    starTransformDistance: 5.0,     // (transform) Duration of the pulsar-to-crystal transformation.
    starTravelDistance: 10.0,       // (exit) Entry and exit travel duration.

    /*
    10-20: enter
    20-30: hold
    30-35: transform
    35-45: exit
    */

    // Particle and Buff Settings
    particleCountPerExplosion: 15,
    particleMinLifetime: 15,
    particleMaxLifetime: 35,
    particleMinSpeed: 1.5,
    particleMaxSpeed: 5,

    // Buff Settings
    buffDropChance: 0.12,
    buffFallSpeed: 2.5,
    buffMagnetRadius: 400,
    buffMagnetSpeed: 10,

    // Enemy Settings
    enemyProjectileSpeed: 8,
    enemyShootingRange: 620,
    enemyFireCooldown: 80,

    // Rapid Fire and Shield Settings
    rapidFireCooldown: 4,
    rapidFireDuration: 360,
    shieldDuration: 600,
};
