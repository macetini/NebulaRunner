import type { GameConfig } from '../core/GameConfig';
import type { EnemyMovementType } from '../views/types/EnemyProfile';
import { ChaseMovement } from './ChaseMovement';
import { LoopingMovement } from './LoopingMovement';
import type { IMovementStrategy } from './meta/IMovementStrategy';
import { SineChainMovement } from './SineChainMovement';
import { SineMovement } from './SineMovement';
import { StaticMovement } from './StaticMovement';
import { StraightMovement } from './StraightMovement';

type MovementCreator = (config: GameConfig, profileSpeedMultiplier: number) => IMovementStrategy;

export class EnemyMovementFactory {
    private readonly creators: Record<EnemyMovementType, MovementCreator> = {
        straight: (config, profileSpeedMultiplier) => new StraightMovement(config, profileSpeedMultiplier),
        sine: (config, profileSpeedMultiplier) => new SineMovement(config, profileSpeedMultiplier),
        chase: (config, profileSpeedMultiplier) => new ChaseMovement(config, profileSpeedMultiplier),
        sineChain: (config, profileSpeedMultiplier) => new SineChainMovement(config, profileSpeedMultiplier),
        looping: (config, profileSpeedMultiplier) => new LoopingMovement(config, profileSpeedMultiplier),
        static: (config) => new StaticMovement(config),
    };

    private readonly config: GameConfig;

    constructor(config: GameConfig) {
        this.config = config;
    }

    public create(type: EnemyMovementType, profileSpeedMultiplier: number): IMovementStrategy {
        return this.creators[type](this.config, profileSpeedMultiplier);
    }
}
