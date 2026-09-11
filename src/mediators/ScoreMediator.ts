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
            .ENEMY_DIED, (event) => {
                const score = (event as CustomEvent<{ defeated: boolean; score: number }>).detail;
                if (score.defeated) {
                    this.incrementScore(score.score);
                }
            });

        this.signalBus.addEventListener(GameSignals.RUN_RESTARTED, () => {
                this.currentScore = 0;
                this.view.updateScore(this.currentScore);
        });

    }

    private incrementScore(points: number): void {
        this.currentScore += points;
        this.view.updateScore(this.currentScore);
    }
}