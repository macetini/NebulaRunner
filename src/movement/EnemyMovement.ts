import type { GameConfig } from '../core/GameConfig';
import type { EnemyProfile } from '../views/types/EnemyProfile';
import { EnemyMovementFactory } from './EnemyMovementFactory';
import type { MovementPosition, IMovementStrategy } from './meta/IMovementStrategy';

export class EnemyMovement {
    private readonly position: MovementPosition = { x: 0, y: 0 };
    private readonly factory: EnemyMovementFactory;
    private strategy: IMovementStrategy;

    constructor(profile: EnemyProfile, config: GameConfig) {
        this.factory = new EnemyMovementFactory(config);
        this.strategy = this.factory.create(profile.movement, profile.speedMultiplier);
    }

    public get x(): number {
        return this.position.x;
    }

    public get y(): number {
        return this.position.y;
    }

    public setProfile(profile: EnemyProfile): void {
        this.strategy = this.factory.create(profile.movement, profile.speedMultiplier);
        this.strategy.reset(this.position);
    }

    public resetPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
        this.strategy.reset(this.position);
    }

    public update(delta: number, targetX: number, speedMultiplier: number): void {
        this.strategy.update(this.position, delta, targetX, speedMultiplier);
    }
}
