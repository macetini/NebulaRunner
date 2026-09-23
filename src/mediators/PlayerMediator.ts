import type { BuffSystem } from "../buffs/BuffSystem";
import { GameSignals } from "../core/GameSignals";
import type { InputController } from '../core/InputController';
import type { IContextItem } from "../core/meta/IContextItem";
import { SignalBus } from "../core/SignalBus";
import type { PlayerView } from "../views/PlayerView";
import type { WeaponSystem } from "../weapons/WeaponSystem";

export class PlayerMediator implements IContextItem {
    private readonly view: PlayerView;
    private readonly input: InputController;
    private readonly buffs: BuffSystem;
    private readonly weapons: WeaponSystem;
    private fireTimer: number = 0;

    private readonly signalBus: SignalBus;
    constructor(
        view: PlayerView,
        signalBus: SignalBus,
        input: InputController,
        buffs: BuffSystem,
        weapons: WeaponSystem,
    ) {
        this.view = view;
        this.input = input;
        this.buffs = buffs;
        this.weapons = weapons;

        this.signalBus = signalBus;
        this.signalBus.addEventListener(GameSignals.PLAYER_DIED, () => {
            this.view.visible = false;
        });

        this.signalBus.addEventListener(GameSignals.RUN_RESTARTED, () => {
            this.fireTimer = 0;
            this.view.resetPosition();
            this.view.resetShield();
            this.view.visible = true;
        });

        this.signalBus.addEventListener(GameSignals.ENEMY_DIED, () => {
            this.view.rechargeBoost();
        });
    }

    public update(delta: number): void {
        this.view.setShieldActive(this.buffs.shieldActive);
        this.view.updateShield(delta);
        this.view.updateBoost(delta);

        if (this.input.consumeBoostRequest()) {
            this.view.tryBoost();
        }

        const input = this.input.current;
        if (input.left) {
            this.view.moveLeft(delta);
        }

        if (input.right) {
            this.view.moveRight(delta);
        }

        if (input.touchActive) {
            this.view.moveToward(input.touchX, delta);
        }

        this.fireTimer -= delta;
        if (input.fire) {
            if (this.fireTimer > 0) {
                return;
            }
            this.weapons.fire(this.view.x, this.view.y);

            this.fireTimer = this.buffs.fireCooldown;
        }
    }
}
