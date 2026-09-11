import * as PIXI from 'pixi.js';

import { BuffStatusView } from './BuffStatusView';
import { GameStateView } from './GameStateView';
import { ScoreView } from './ScoreView';

export class GameUi extends PIXI.Container {
    public readonly score = new ScoreView();
    public readonly buffs = new BuffStatusView();
    public readonly state = new GameStateView();

    constructor() {
        super();
        this.addChild(this.score, this.buffs, this.state);
    }

    public updateBuffStatus(remaining: number, duration: number): void {
        this.buffs.update(remaining, duration);
    }
}