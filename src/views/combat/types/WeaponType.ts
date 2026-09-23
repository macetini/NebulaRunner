export const WeaponType = {
    BLASTER: 'blaster'
} as const;

export type WeaponType = (typeof WeaponType)[keyof typeof WeaponType];
