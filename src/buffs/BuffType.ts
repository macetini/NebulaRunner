export const BuffType = {
    RAPID_FIRE: 'rapidFire',
} as const;

export type BuffType = (typeof BuffType)[keyof typeof BuffType];
