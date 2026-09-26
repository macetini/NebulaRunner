// src/mediators/gameplay/PlayerMediator.ts
import type { IContextItem } from "../../core/context/meta/IContextItem";
import { GameSignals } from "../../core/game/GameSignals";
import type { InputController } from "../../core/game/InputController";
import type { SignalBus } from "../../core/game/SignalBus";
import type { PlayerView } from "../../views/gameplay/PlayerView";


export class PlayerMediator implements IContextItem {
    private readonly view: PlayerView;
    private readonly signalBus: SignalBus;
    private readonly input: InputController;

    constructor(
        view: PlayerView,
        signalBus: SignalBus,
        input: InputController
    ) {
        this.view = view;
        this.signalBus = signalBus;
        this.input = input;

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
    }

    private updateShieldAndBoost(delta: number): void {
        this.view.updateShield(delta);
        this.view.updateBoost(delta);

        if (this.input.consumeBoostRequest()) {
            this.view.tryBoost();
        }
    }

    private handleMovementInput(delta: number): void {
        const input = this.input.current;

        const prevX = this.view.x;
        const prevY = this.view.y;

        if (input.left) {
            this.view.moveLeft(delta);
        }

        if (input.right) {
            this.view.moveRight(delta);
        }

        if (input.touchActive) {
            this.view.moveToward(input.touchX, delta);
        }

        if (this.view.x !== prevX || this.view.y !== prevY) {
            this.signalBus.dispatch(GameSignals.PLAYER_MOVED, { x: this.view.x, y: this.view.muzzleY });
        }
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.PLAYER_DIED, this.onPlayerDied);
        this.signalBus.removeEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
        this.signalBus.removeEventListener(GameSignals.ENEMY_DIED, this.onEnemyDied);
    }
}
