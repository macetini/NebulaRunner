import type { GameConfig } from '../core/GameConfig';
import type { MovementPosition, MovementStrategy } from './MovementStrategy';

export class StraightMovement implements MovementStrategy {
    private readonly config: GameConfig;
    private readonly profileSpeedMultiplier: number;

    constructor(config: GameConfig, profileSpeedMultiplier: number) {
        this.config = config;
        this.profileSpeedMultiplier = profileSpeedMultiplier;
    }

    public reset(_position: MovementPosition): void {
        // Straight movement has no state to reset.
    }

    public update(position: MovementPosition, delta: number, _targetX: number, speedMultiplier: number): void {
        position.y += this.config.enemySpeed * delta * this.profileSpeedMultiplier * speedMultiplier;
    }
}
