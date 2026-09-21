export const BuffType = {
    RAPID_FIRE: 'rapidFire',
    SHIELD: 'shield',
} as const;

export type BuffType = (typeof BuffType)[keyof typeof BuffType];
