import type { ProjectileSpawnOptions } from "../../projectiles/ProjectileConfig";

export type WeaponBalance = {
    id: string;
    damage: number;
    fireCooldown: number;
    piercing: boolean;
    projectile: ProjectileSpawnOptions;
};
