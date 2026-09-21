export const BuffType = {
    RAPID_FIRE: 'rapidFire',
    SHIELD: 'shield',
    EXPLOSION: 'explosion',
} as const;

export type BuffType = (typeof BuffType)[keyof typeof BuffType];
