import type { GameConfig } from '../core/GameConfig';
import type { EnemyMovementType } from '../views/types/EnemyProfile';
import { ChaseMovement } from './ChaseMovement';
import type { MovementStrategy } from './MovementStrategy';
import { SineMovement } from './SineMovement';
import { StraightMovement } from './StraightMovement';

type MovementCreator = (config: GameConfig, profileSpeedMultiplier: number) => MovementStrategy;

export class EnemyMovementFactory {
    private readonly creators: Record<EnemyMovementType, MovementCreator> = {
        straight: (config, profileSpeedMultiplier) => new StraightMovement(config, profileSpeedMultiplier),
        sine: (config, profileSpeedMultiplier) => new SineMovement(config, profileSpeedMultiplier),
        chase: (config, profileSpeedMultiplier) => new ChaseMovement(config, profileSpeedMultiplier),
    };

    private readonly config: GameConfig;

    constructor(config: GameConfig) {
        this.config = config;
    }

    public create(type: EnemyMovementType, profileSpeedMultiplier: number): MovementStrategy {
        return this.creators[type](this.config, profileSpeedMultiplier);
    }
}
