import type { EnemyProfile } from '../views/types/EnemyProfile';
import { EnemyType } from '../views/types/EnemyType';
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

        if (elapsedTime >= 15) {
            availableProfiles.push(this.createProfile(EnemyType.CHASER));
        }
        if (elapsedTime >= 30) {
            availableProfiles.push(this.createProfile(EnemyType.ARMORED));
        }

        const profileIndex = Math.floor(Math.random() * availableProfiles.length);
        return availableProfiles[profileIndex] ?? this.createProfile(EnemyType.DRIFTER);
    }

    private createProfile(type: EnemyType): EnemyProfile {
        switch (type) {
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
        }
    }
}
