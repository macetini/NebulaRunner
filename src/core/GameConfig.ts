export type GameConfig = {
    playerSpeed: number;
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
    projectileSpeed: number;
    fireCooldown: number;
    collisionDistance: number;
    backgroundSpeed: number;
};

export const gameConfig: GameConfig = {
    playerSpeed: 6,
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
    projectileSpeed: 12,
    fireCooldown: 10,
    collisionDistance: 25,
    backgroundSpeed: 3,
};
