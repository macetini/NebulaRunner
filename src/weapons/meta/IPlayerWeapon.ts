import type { SignalBus } from '../../core/SignalBus';
import type { HitboxPool } from '../../pools/HitboxPool';

export type WeaponFireContext = {
    x: number;
    y: number;

    hitboxPool: HitboxPool;
    signalBus: SignalBus;

    directionX?: number;
    directionY?: number;
};

export interface IPlayerWeapon {
    readonly id: string;
    fire(context: WeaponFireContext): void;
}
