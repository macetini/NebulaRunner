import { GameSignals } from "../core/GameSignals";
import type { SignalBus } from "../core/SignalBus";
import type { ScoreView } from "../views/ScoreView";

export class ScoreMediator {
    private currentScore: number = 0;

    private readonly view: ScoreView;
    private readonly signalBus: SignalBus;

    constructor(
        view: ScoreView,
        signalBus: SignalBus
    ) {
        this.view = view;
        this.signalBus = signalBus;

        this.signalBus.addEventListener(GameSignals
            .ENEMY_DIED, () => {
                this.incrementScore();
            });
    }

    private incrementScore(): void {
        this.currentScore += 1;
        this.view.updateScore(this.currentScore);
    }
}