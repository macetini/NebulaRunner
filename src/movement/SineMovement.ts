import type { GameConfig } from '../core/GameConfig';
import type { MovementPosition, IMovementStrategy } from './meta/IMovementStrategy';

export class SineMovement implements IMovementStrategy {
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
        position.y += this.config.enemySpeed * delta * this.profileSpeedMultiplier * speedMultiplier;
        this.time += this.config.enemySineOscillationSpeed * delta;
        position.x = this.baseX + Math.sin(this.time) * this.config.enemySineOscillationAmplitude;
    }
}
