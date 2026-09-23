import { GameSignals } from "../../core/GameSignals";
import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class PlasmaCannonWeapon implements IPlayerWeapon {
    public readonly id = 'plasmaCannon';

    public fire(context: WeaponFireContext): void {
        // 1. Dispatch signal to keep PlasmaBeamView active
        context.signalBus?.dispatch(GameSignals.PLASMA_BEAM_ACTIVE, {
            x: context.x,
            y: context.y,
        });

        // 2. Spawn invisible beam hitboxes up to y = 0
        context.projectilePool.spawnBeamSegment(context.x, context.y, {
            width: 12, // Match or exceed effective shader beam core width
            damage: 0.1,
            isPiercing: true,
        });
    }
}
