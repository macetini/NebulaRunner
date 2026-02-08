export const EnemyType = {
    DIAGONAL: 'diagonal',
    SINE: 'sine'
} as const;

export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];