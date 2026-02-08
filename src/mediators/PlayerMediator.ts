import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import { SignalBus } from "../core/SignalBus";
import type { PlayerView } from "../views/PlayerView";

export class PlayerMediator implements IContextItem {
    private readonly view: PlayerView;
    private readonly keys: Record<string, boolean>;

    private readonly signalBus: SignalBus;
    constructor(
        view: PlayerView,
        signalBus: SignalBus,
        keys: Record<string, boolean>
    ) {
        this.view = view;
        this.keys = keys;

        this.signalBus = signalBus;
    }

    public update(delta: number): void {
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.view.moveUp(delta);
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.view.moveDown(delta);
        }

        if (this.keys['Space']) {
            this.signalBus.dispatch(GameSignals.PLAYER_FIRED, {
                x: this.view.x,
                y: this.view.y
            });

            this.keys['Space'] = false;
        }
    }
}
