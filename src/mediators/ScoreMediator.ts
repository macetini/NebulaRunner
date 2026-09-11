import { GameSignals } from "../core/GameSignals";
import type { SignalBus } from "../core/SignalBus";
import type { SaveStorage } from '../persistence/SaveStorage';
import type { ScoreView } from "../ui/ScoreView";

export class ScoreMediator {
    private static readonly BEST_SCORE_KEY = 'nebula-runner:v1:best-score';
    private currentScore: number = 0;
    private bestScore: number;

    private readonly view: ScoreView;
    private readonly signalBus: SignalBus;
    private readonly storage: SaveStorage;

    constructor(
        view: ScoreView,
        signalBus: SignalBus,
        storage: SaveStorage,
    ) {
        this.view = view;
        this.signalBus = signalBus;
        this.storage = storage;
        this.bestScore = this.loadBestScore();
        this.view.updateScore(this.currentScore, this.bestScore);

        this.signalBus.addEventListener(GameSignals
            .ENEMY_DIED, (event) => {
                const score = (event as CustomEvent<{ defeated: boolean; score: number }>).detail;
                if (score.defeated) {
                    this.incrementScore(score.score);
                }
            });

        this.signalBus.addEventListener(GameSignals.RUN_RESTARTED, () => {
                this.currentScore = 0;
                this.view.updateScore(this.currentScore, this.bestScore);
        });

    }

    public get current(): number {
        return this.currentScore;
    }

    public get best(): number {
        return this.bestScore;
    }

    private incrementScore(points: number): void {
        this.currentScore += points;
        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            this.saveBestScore(this.bestScore);
        }
        this.view.updateScore(this.currentScore, this.bestScore);
    }

    private loadBestScore(): number {
        try {
            const storedScore = Number.parseInt(this.storage.get(ScoreMediator.BEST_SCORE_KEY) ?? '0', 10);
            return Number.isFinite(storedScore) && storedScore >= 0 ? storedScore : 0;
        } catch {
            return 0;
        }
    }

    private saveBestScore(score: number): void {
        this.storage.set(ScoreMediator.BEST_SCORE_KEY, score.toString());
    }
}