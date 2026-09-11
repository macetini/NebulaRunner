import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import { SignalBus } from "../core/SignalBus";
import type { PlayerView } from "../views/PlayerView";
import type { InputController } from '../core/InputController';
import type { GameConfig } from '../core/GameConfig';

export class PlayerMediator implements IContextItem {
    private readonly view: PlayerView;
    private readonly input: InputController;
    private readonly config: GameConfig;
    private fireTimer: number = 0;

    private readonly signalBus: SignalBus;
    constructor(
        view: PlayerView,
        signalBus: SignalBus,
        input: InputController,
        config: GameConfig,
    ) {
        this.view = view;
        this.input = input;
        this.config = config;

        this.signalBus = signalBus;
        this.signalBus.addEventListener(GameSignals.PLAYER_DIED, () => {
            this.view.resetPosition();
        });
    }

    public update(delta: number): void {
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
            this.signalBus.dispatch(GameSignals.PLAYER_FIRED, {
                x: this.view.x,
                y: this.view.y
            });

            this.fireTimer = this.config.fireCooldown;
        }
    }
}
