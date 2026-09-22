import type { GameConfig } from '../core/GameConfig';
import type { MovementPosition, MovementStrategy } from './MovementStrategy';

export class StaticMovement implements MovementStrategy {
    private readonly config: GameConfig;

    constructor(config: GameConfig) {
        this.config = config;
    }

    public reset(_position: MovementPosition): void {
        // Static items are stationary relative to the scrolling environment.
    }

    public update(position: MovementPosition, delta: number, _targetX: number, _speedMultiplier: number): void {
        position.y += this.config.backgroundSpeed * delta;
    }
}
