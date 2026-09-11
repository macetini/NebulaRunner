import type { GameConfig } from '../core/GameConfig';
import type { MovementPosition, MovementStrategy } from './MovementStrategy';

export class ChaseMovement implements MovementStrategy {
    private readonly config: GameConfig;
    private readonly profileSpeedMultiplier: number;

    constructor(config: GameConfig, profileSpeedMultiplier: number) {
        this.config = config;
        this.profileSpeedMultiplier = profileSpeedMultiplier;
    }

    public reset(_position: MovementPosition): void {
        // Chase movement has no state to reset.
    }

    public update(position: MovementPosition, delta: number, targetX: number, speedMultiplier: number): void {
        position.y += this.config.enemySpeed * delta * this.profileSpeedMultiplier * speedMultiplier;
        const distance = targetX - position.x;
        const chaseStep = this.config.enemyChaseSpeed * delta;
        position.x += Math.sign(distance) * Math.min(Math.abs(distance), chaseStep);
    }
}
