import * as PIXI from 'pixi.js';
import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';

type FeedbackEffect = {
    view: PIXI.Graphics;
    age: number;
    duration: number;
    growth: number;
};

export class CombatFeedbackMediator implements IContextItem {
    private readonly stage: PIXI.Container;
    private readonly effects: FeedbackEffect[] = [];

    constructor(stage: PIXI.Container, signalBus: SignalBus) {
        this.stage = stage;
        signalBus.addEventListener(GameSignals.ENEMY_DIED, this.handleEnemyHit);
    }

    public update(delta: number): void {
        for (let index = this.effects.length - 1; index >= 0; index -= 1) {
            const effect = this.effects[index];
            effect.age += delta;
            effect.view.scale.set(1 + effect.age * effect.growth);
            effect.view.alpha = Math.max(0, 1 - effect.age / effect.duration);

            if (effect.age >= effect.duration) {
                effect.view.destroy();
                this.effects.splice(index, 1);
            }
        }
    }

    private readonly handleEnemyHit = (event: Event): void => {
        const { x, y, defeated } = (event as CustomEvent<{
            x: number;
            y: number;
            defeated: boolean;
        }>).detail;
        const view = new PIXI.Graphics()
            .circle(0, 0, defeated ? 16 : 10)
            .stroke({ width: defeated ? 3 : 2, color: defeated ? 0xFFFFFF : 0xFFEE00 });
        view.position.set(x, y);
        this.stage.addChild(view);
        this.effects.push({
            view,
            age: 0,
            duration: defeated ? 18 : 10,
            growth: defeated ? 0.18 : 0.1,
        });
    };
}
