import type { EnemyProfile } from '../views/combat/types/EnemyProfile';
import { EnemyType } from '../views/combat/types/EnemyType';
import type { GameConfig } from './GameConfig';

export class EnemyFactory {
    private readonly config: GameConfig;

    constructor(config: GameConfig) {
        this.config = config;
    }

    public createRandom(elapsedTime: number): EnemyProfile {
        const availableProfiles = [
            this.createProfile(EnemyType.DRIFTER),
            this.createProfile(EnemyType.FAST_DIVER),
        ];

        if (elapsedTime >= 10) {
            availableProfiles.push(this.createProfile(EnemyType.SINE_CHAIN));
        }
        if (elapsedTime >= 18) {
            availableProfiles.push(this.createProfile(EnemyType.SWARMER));
        }
        if (elapsedTime >= 28) {
            availableProfiles.push(this.createProfile(EnemyType.CHASER));
        }
        if (elapsedTime >= 34) {
            availableProfiles.push(this.createProfile(EnemyType.STRIKER));
        }
        if (elapsedTime >= 40) {
            availableProfiles.push(this.createProfile(EnemyType.ARMORED));
        }

        const profileIndex = Math.floor(Math.random() * availableProfiles.length);
        return availableProfiles[profileIndex] ?? this.createProfile(EnemyType.DRIFTER);
    }

    public createStaticBox(): EnemyProfile {
        const boxProfiles: EnemyProfile[] = [
            {
                type: EnemyType.STATIC_BOX,
                movement: 'static',
                color: 0x88DDFF,
                speedMultiplier: 1,
                health: 1,
                score: this.config.staticBoxSmallScore,
                scale: 0.7,
            },
            {
                type: EnemyType.STATIC_BOX,
                movement: 'static',
                color: 0xFFCC33,
                speedMultiplier: 1,
                health: 1,
                score: this.config.staticBoxMediumScore,
                scale: 1,
            },
            {
                type: EnemyType.STATIC_BOX,
                movement: 'static',
                color: 0xFF7755,
                speedMultiplier: 1,
                health: 1,
                score: this.config.staticBoxLargeScore,
                scale: 1.45,
            },
        ];
        const profileIndex = Math.floor(Math.random() * boxProfiles.length);
        return boxProfiles[profileIndex] ?? boxProfiles[0];
    }

    private createProfile(type: EnemyType): EnemyProfile {
        switch (type) {
            case EnemyType.SWARMER:
                return {
                    type,
                    movement: 'looping',
                    color: 0xFF3399,
                    speedMultiplier: 1.25,
                    health: 1,
                    score: 4,
                };
            case EnemyType.SINE_CHAIN:
                return {
                    type,
                    movement: 'sineChain',
                    color: 0x33FF99,
                    speedMultiplier: 1.1,
                    health: 1,
                    score: 3,
                };
            case EnemyType.FAST_DIVER:
                return {
                    type,
                    movement: 'straight',
                    color: 0xFF3333,
                    speedMultiplier: 1.5,
                    health: 1,
                    score: 2,
                };
            case EnemyType.CHASER:
                return {
                    type,
                    movement: 'chase',
                    color: 0xFFAA33,
                    speedMultiplier: 0.8,
                    health: 1,
                    score: 3,
                };
            case EnemyType.STRIKER:
                return {
                    type,
                    movement: 'chase',
                    color: 0xFF3333,
                    speedMultiplier: 0.75,
                    health: 2,
                    score: 6,
                };
            case EnemyType.ARMORED:
                return {
                    type,
                    movement: 'straight',
                    color: 0x33AAFF,
                    speedMultiplier: 0.65,
                    health: this.config.armoredEnemyHealth,
                    score: 5,
                };
            case EnemyType.DRIFTER:
                return {
                    type,
                    movement: 'sine',
                    color: 0xAA33FF,
                    speedMultiplier: 1,
                    health: 1,
                    score: 1,
                };
            case EnemyType.STATIC_BOX:
                return {
                    type,
                    movement: 'static',
                    color: 0xFFCC33,
                    speedMultiplier: 1,
                    health: 1,
                    score: this.config.staticBoxMediumScore,
                };
        }
    }
}
