export const EnemyType = {
    FAST_DIVER: 'fastDiver',
    DRIFTER: 'drifter',
    CHASER: 'chaser',
    ARMORED: 'armored',
    SINE_CHAIN: 'sineChain',
    SWARMER: 'swarmer',
} as const;

export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];
