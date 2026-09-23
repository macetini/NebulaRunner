import * as PIXI from 'pixi.js';
import { GameSignals } from '../../core/GameSignals';
import type { IContextItem } from '../../core/meta/IContextItem';
import type { SignalBus } from '../../core/SignalBus';

type FeedbackEffect = {
    view: PIXI.Graphics;
    age: number;
    duration: number;
    growth: number;
    rotationSpeed: number;
};

export class CombatMediator implements IContextItem {
    private readonly stage: PIXI.Container;
    private readonly effects: FeedbackEffect[] = [];

    constructor(stage: PIXI.Container, signalBus: SignalBus) {
        this.stage = stage;

        signalBus.addEventListener(GameSignals.ENEMY_DIED, this.handleEnemyHit);
        signalBus.addEventListener(GameSignals.PLAYER_DIED, this.handlePlayerDeath);
        signalBus.addEventListener(GameSignals.EXPLOSION_TRIGGERED, this.handleExplosion);
    }

    public update(delta: number): void {
        for (let index = this.effects.length - 1; index >= 0; index -= 1) {
            const effect = this.effects[index];

            effect.age += delta;
            effect.view.scale.set(1 + effect.age * effect.growth);
            effect.view.rotation += effect.rotationSpeed;
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
            rotationSpeed: defeated ? 0.08 : 0,
        });
    };

    private readonly handlePlayerDeath = (event: Event): void => {
        const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail;

        const view = new PIXI.Graphics();

        for (let index = 0; index < 8; index += 1) {
            const angle = (Math.PI * 2 * index) / 8;
            view.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
            view.lineTo(Math.cos(angle) * 28, Math.sin(angle) * 28);
        }

        view.stroke({ width: 3, color: 0x00FFFF });
        view.position.set(x, y);

        this.stage.addChild(view);

        this.effects.push({
            view,
            age: 0,
            duration: 28,
            growth: 0.1,
            rotationSpeed: 0.12,
        });
    };

    private readonly handleExplosion = (event: Event): void => {
        const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail;

        const view = new PIXI.Graphics()
            .circle(0, 0, 900)
            .fill({ color: 0xFFFFFF, alpha: 0.12 })
            .circle(0, 0, 34)
            .stroke({ width: 5, color: 0xFFCC66, alpha: 0.95 });

        for (let index = 0; index < 12; index += 1) {
            const angle = (Math.PI * 2 * index) / 12;
            view.moveTo(Math.cos(angle) * 24, Math.sin(angle) * 24);
            view.lineTo(Math.cos(angle) * 56, Math.sin(angle) * 56);
        }

        view.stroke({ width: 3, color: 0xFFFFFF, alpha: 0.9 });
        view.position.set(x, y);

        this.stage.addChild(view);

        this.effects.push({
            view,
            age: 0,
            duration: 30,
            growth: 0.04,
            rotationSpeed: 0.04,
        });
    };
}
