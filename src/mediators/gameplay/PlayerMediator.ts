import type { BuffSystem } from "../../buffs/BuffSystem";
import { GameSignals } from "../../core/game/GameSignals";
import type { InputController } from "../../core/game/InputController";
import type { IContextItem } from "../../core/context/meta/IContextItem";
import type { SignalBus } from "../../core/game/SignalBus";
import type { PlayerView } from "../../views/gameplay/PlayerView";
import type { WeaponSystem } from "../../weapons/WeaponSystem";


export class PlayerMediator implements IContextItem {
    private readonly view: PlayerView;
    private readonly signalBus: SignalBus;
    private readonly input: InputController;
    private readonly buffs: BuffSystem;
    private readonly weapons: WeaponSystem;
    private fireTimer: number = 0;

    constructor(
        view: PlayerView,
        signalBus: SignalBus,
        input: InputController,
        buffs: BuffSystem,
        weapons: WeaponSystem
    ) {
        this.view = view;
        this.signalBus = signalBus;
        this.input = input;
        this.buffs = buffs;
        this.weapons = weapons;

        this.setupSignalListeners();
    }

    private setupSignalListeners(): void {
        this.signalBus.addEventListener(GameSignals.PLAYER_DIED, this.onPlayerDied);
        this.signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
        this.signalBus.addEventListener(GameSignals.ENEMY_DIED, this.onEnemyDied);
    }

    private onPlayerDied = (): void => {
        this.view.visible = false;
    };

    private onRunRestarted = (): void => {
        this.fireTimer = 0;
        this.view.resetPosition();
        this.view.resetShield();
        this.view.visible = true;
    };

    private onEnemyDied = (): void => {
        this.view.rechargeBoost();
    };

    public update(delta: number): void {
        this.updateShieldAndBoost(delta);
        this.handleMovementInput(delta);
        this.handleWeaponFiring(delta);
    }

    private updateShieldAndBoost(delta: number): void {
        this.view.setShieldActive(this.buffs.shieldActive);
        this.view.updateShield(delta);
        this.view.updateBoost(delta);

        if (this.input.consumeBoostRequest()) {
            this.view.tryBoost();
        }
    }

    private handleMovementInput(delta: number): void {
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
    }

    private handleWeaponFiring(delta: number): void {
        this.fireTimer -= delta;
        if (this.fireTimer <= 0) {
            const emissions = this.weapons.fire(this.view.x, this.view.y);
            this.signalBus.dispatch(GameSignals.PLAYER_FIRED, { emissions });
            this.fireTimer = this.buffs.fireCooldown;
        }
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.PLAYER_DIED, this.onPlayerDied);
        this.signalBus.removeEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
        this.signalBus.removeEventListener(GameSignals.ENEMY_DIED, this.onEnemyDied);
    }
}
