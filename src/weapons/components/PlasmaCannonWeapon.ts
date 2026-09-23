import { GameSignals } from "../../core/GameSignals";
import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class PlasmaCannonWeapon implements IPlayerWeapon {
    public readonly id = 'plasmaCannon';
    public readonly fireCooldown = 1; // Sustained beam cadence

    public fire(context: WeaponFireContext): void {
        // Dispatch signal to activate/tick the beam visual
        context.signalBus?.dispatch(GameSignals.PLASMA_BEAM_ACTIVE, {
            x: context.x,
            y: context.y,
        });

        // Spawn beam hitboxes in the projectile pool

        context.projectiles.spawnBeamSegment(context.x, context.y, {
            width: 24,
            damage: 0.5,
            isPiercing: true,
        });
    }
}
