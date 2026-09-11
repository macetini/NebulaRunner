import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import { SignalBus } from "../core/SignalBus";
import type { PlayerView } from "../views/PlayerView";

export class PlayerMediator implements IContextItem {
    private readonly view: PlayerView;
    private readonly keys: Record<string, boolean>;
    private readonly touch: { active: boolean; x: number };
    private fireTimer: number = 0;

    private readonly signalBus: SignalBus;
    constructor(
        view: PlayerView,
        signalBus: SignalBus,
        keys: Record<string, boolean>,
        touch: { active: boolean; x: number },
    ) {
        this.view = view;
        this.keys = keys;
        this.touch = touch;

        this.signalBus = signalBus;
        this.signalBus.addEventListener(GameSignals.PLAYER_DIED, () => {
            this.view.resetPosition();
        });
    }

    public update(delta: number): void {
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.view.moveLeft(delta);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.view.moveRight(delta);
        }

        if (this.touch.active) {
            this.view.moveToward(this.touch.x, delta);
        }

        this.fireTimer -= delta;
        if (this.keys['Space'] || this.touch.active) {
            if (this.fireTimer > 0) {
                return;
            }
            this.signalBus.dispatch(GameSignals.PLAYER_FIRED, {
                x: this.view.x,
                y: this.view.y
            });

            this.keys['Space'] = false;
            this.fireTimer = 10;
        }
    }
}
