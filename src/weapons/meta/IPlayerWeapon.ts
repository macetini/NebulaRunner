import type { SignalBus } from '../../core/SignalBus';
import type { ProjectilePool } from '../../pools/ProjectilePool';

export type WeaponFireContext = {
    x: number;
    y: number;

    projectiles: ProjectilePool;
    signalBus: SignalBus;

    directionX?: number;
    directionY?: number;
};

export interface IPlayerWeapon {
    readonly id: string;
    /** Primary firing execution */
    fire(context: WeaponFireContext): void;
}
