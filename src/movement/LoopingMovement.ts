import type { GameConfig } from '../core/game/GameConfig';
import type { MovementPosition, IMovementStrategy } from './meta/IMovementStrategy';

export class LoopingMovement implements IMovementStrategy {
    private readonly config: GameConfig;
    private readonly profileSpeedMultiplier: number;
    private time = 0;
    private baseX = 0;
    private baseY = 0;

    constructor(config: GameConfig, profileSpeedMultiplier: number) {
        this.config = config;
        this.profileSpeedMultiplier = profileSpeedMultiplier;
    }

    public reset(position: MovementPosition): void {
        this.baseX = position.x;
        this.baseY = position.y;
        this.time = 0;
    }

    public update(position: MovementPosition, delta: number, _targetX: number, speedMultiplier: number): void {
        // Linearly descend the base coordinate (tuned slower so actual upward loops are possible)
        const downwardSpeed = this.config.enemySpeed * delta * (this.profileSpeedMultiplier * 0.45) * speedMultiplier;
        this.baseY += downwardSpeed;

        // Rotate while radius expands: entry becomes a descending spiral.
        this.time += 0.14 * delta;

        const radius = Math.min(45, 10 + this.time * 1.5);

        // Output position coordinates with circular offset
        position.x = this.baseX + Math.cos(this.time) * radius;
        position.y = this.baseY + Math.sin(this.time) * radius;
    }
}
