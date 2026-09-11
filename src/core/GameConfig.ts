export type GameConfig = {
    playerSpeed: number;
    enemySpeed: number;
    enemySineOscillationSpeed: number;
    enemySineOscillationAmplitude: number;
    enemySpawnInterval: number;
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
    enemySpawnInterval: 100,
    projectileSpeed: 12,
    fireCooldown: 10,
    collisionDistance: 25,
    backgroundSpeed: 3,
};
