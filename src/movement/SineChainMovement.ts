import type { GameConfig } from '../core/game/GameConfig';
import type { MovementPosition, IMovementStrategy } from './meta/IMovementStrategy';

export class SineChainMovement implements IMovementStrategy {
    private readonly config: GameConfig;
    private readonly profileSpeedMultiplier: number;
    private time = 0;
    private baseX = 0;

    constructor(config: GameConfig, profileSpeedMultiplier: number) {
        this.config = config;
        this.profileSpeedMultiplier = profileSpeedMultiplier;
    }

    public reset(position: MovementPosition): void {
        this.baseX = position.x;
        this.time = 0;
    }

    public update(position: MovementPosition, delta: number, _targetX: number, speedMultiplier: number): void {
        // Move down with speed
        position.y += this.config.enemySpeed * delta * this.profileSpeedMultiplier * speedMultiplier;

        // Slightly faster oscillation than standard sine to make the wave nice and curly
        this.time += this.config.enemySineOscillationSpeed * delta * 1.5;

        // Wider amplitude so that the chain snaking looks distinct and dramatic
        position.x = this.baseX + Math.sin(this.time) * (this.config.enemySineOscillationAmplitude * 4.5);
    }
}
