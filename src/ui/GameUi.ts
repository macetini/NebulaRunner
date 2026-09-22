import * as PIXI from 'pixi.js';

import { BuffStatusView } from './BuffStatusView';
import { GameStateView } from './GameStateView';
import { PerformanceStatsView } from './PerformanceStatsView';
import { ScoreView } from './ScoreView';

export class GameUi extends PIXI.Container {
    public readonly score = new ScoreView();
    public readonly buffs = new BuffStatusView('RAPID FIRE', 0xFFE066, 92);
    public readonly shield = new BuffStatusView('SHIELD', 0x55CCFF, 140);
    public readonly state = new GameStateView();
    private readonly performanceStats?: PerformanceStatsView;

    constructor(showPerformanceStats: boolean) {
        super();
        if (showPerformanceStats) {
            this.performanceStats = new PerformanceStatsView();
        }
        this.addChild(this.score, this.buffs, this.shield, this.state);
        if (this.performanceStats) {
            this.addChild(this.performanceStats);
        }
    }

    public updateBuffStatus(
        rapidFireRemaining: number,
        rapidFireDuration: number,
        shieldRemaining: number,
        shieldDuration: number,
    ): void {
        this.buffs.update(rapidFireRemaining, rapidFireDuration);
        this.shield.update(shieldRemaining, shieldDuration);
    }

    public updatePerformanceStats(fps: number, delta: number, screenWidth: number): void {
        this.performanceStats?.update(fps, delta, screenWidth);
    }
}
