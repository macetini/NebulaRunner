import type { GameConfig } from '../core/game/GameConfig';
import type { MovementPosition, IMovementStrategy } from './meta/IMovementStrategy';

export class StaticMovement implements IMovementStrategy {
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
