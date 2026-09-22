import { EnemyType } from '../views/types/EnemyType';
import type { SpawnPattern } from './SpawnPattern';
import { DefaultSpawnPattern } from './patterns/DefaultSpawnPattern';
import { SineChainSpawnPattern } from './patterns/SineChainSpawnPattern';
import { SwarmerSpawnPattern } from './patterns/SwarmerSpawnPattern';

export class SpawnPatternFactory {
    private readonly defaultPattern: SpawnPattern;
    private readonly patterns: Record<EnemyType, SpawnPattern>;

    constructor() {
        this.defaultPattern = new DefaultSpawnPattern();

        this.patterns = {
            [EnemyType.FAST_DIVER]: this.defaultPattern,
            [EnemyType.DRIFTER]: this.defaultPattern,
            [EnemyType.CHASER]: this.defaultPattern,
            [EnemyType.ARMORED]: this.defaultPattern,
            [EnemyType.STRIKER]: this.defaultPattern,
            [EnemyType.SINE_CHAIN]: new SineChainSpawnPattern(),
            [EnemyType.SWARMER]: new SwarmerSpawnPattern(),
            [EnemyType.STATIC_BOX]: this.defaultPattern,
        };
    }

    public getPattern(type: EnemyType): SpawnPattern {
        return this.patterns[type] ?? this.defaultPattern;
    }
}
