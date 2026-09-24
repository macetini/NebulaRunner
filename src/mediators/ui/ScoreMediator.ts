import { GameSignals } from "../../core/GameSignals";
import type { IContextItem } from "../../core/meta/IContextItem";
import type { SignalBus } from "../../core/SignalBus";
import type { SaveStorage } from "../../persistence/SaveStorage";
import type { ScoreView } from "../../views/ui/ScoreView";

export class ScoreMediator implements IContextItem {
    private static readonly BEST_SCORE_KEY = "nebula-runner:v1:best-score";

    private currentScore: number = 0;
    private bestScore: number;

    private readonly view: ScoreView;
    private readonly signalBus: SignalBus;
    private readonly storage: SaveStorage;

    constructor(
        view: ScoreView,
        signalBus: SignalBus,
        storage: SaveStorage
    ) {
        this.view = view;
        this.signalBus = signalBus;
        this.storage = storage;

        this.bestScore = this.loadBestScore();
        this.view.updateScore(this.currentScore, this.bestScore);

        this.setupSignalListeners();
    }

    private setupSignalListeners(): void {
        this.signalBus.addEventListener(GameSignals.ENEMY_DIED, this.onEnemyDied);
        this.signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
    }

    private onEnemyDied = (event: Event): void => {
        const customEvent = event as CustomEvent<{ defeated?: boolean; score?: number }>;
        const { detail } = customEvent;

        if (detail?.defeated && typeof detail.score === "number") {
            this.incrementScore(detail.score);
        }
    };

    private onRunRestarted = (): void => {
        this.currentScore = 0;
        this.view.updateScore(this.currentScore, this.bestScore);
    };

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
            const rawValue = this.storage.get(ScoreMediator.BEST_SCORE_KEY);
            const storedScore = rawValue ? Number.parseInt(rawValue, 10) : 0;

            return Number.isFinite(storedScore) && storedScore >= 0 ? storedScore : 0;
        } catch {
            return 0;
        }
    }

    private saveBestScore(score: number): void {
        this.storage.set(ScoreMediator.BEST_SCORE_KEY, score.toString());
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.ENEMY_DIED, this.onEnemyDied);
        this.signalBus.removeEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
    }

    update(_delta: number): void {
    }
}
