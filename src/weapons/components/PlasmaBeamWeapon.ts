import { GameSignals } from "../../core/GameSignals";
import type { IPlayerWeapon, WeaponFireContext } from "../meta/IPlayerWeapon";

export class PlasmaBeamWeapon implements IPlayerWeapon {
    public readonly id = 'plasmaBeam';

    public fire(context: WeaponFireContext): void {
        // 1. Dispatch signal to keep PlasmaBeamView active
        context.signalBus?.dispatch(GameSignals.PLASMA_BEAM_ACTIVE, {
            x: context.x,
            y: context.y,
        });

        // 2. Spawn invisible beam hitboxes up to y = 0
        context.hitboxPool.spawnBeamSegment(context.x, context.y, {
            width: 12, // Match or exceed effective shader beam core width
            damage: 0.1,
            isPiercing: true,
        });
    }
}
