import type { GameConfig } from '../core/GameConfig';
import type { EnemyProfile } from '../views/types/EnemyProfile';

export class EnemyMovement {
    private profile: EnemyProfile;
    private readonly config: GameConfig;
    private time = 0;
    private baseX = 0;

    private positionX = 0;
    private positionY = 0;

    constructor(profile: EnemyProfile, config: GameConfig) {
        this.profile = profile;
        this.config = config;
    }

    public get x(): number {
        return this.positionX;
    }

    public get y(): number {
        return this.positionY;
    }

    public setProfile(profile: EnemyProfile): void {
        this.profile = profile;
        this.time = 0;
    }

    public resetPosition(x: number, y: number): void {
        this.positionX = x;
        this.positionY = y;
        this.baseX = x;
        this.time = 0;
    }

    public update(delta: number, targetX: number, speedMultiplier: number): void {
        this.positionY += this.config.enemySpeed * delta * this.profile.speedMultiplier * speedMultiplier;

        if (this.profile.movement === 'sine') {
            this.time += this.config.enemySineOscillationSpeed * delta;
            this.positionX = this.baseX + Math.sin(this.time) * this.config.enemySineOscillationAmplitude;
        }
        if (this.profile.movement === 'chase') {
            const distance = targetX - this.positionX;
            const chaseStep = this.config.enemyChaseSpeed * delta;
            this.positionX += Math.sign(distance) * Math.min(Math.abs(distance), chaseStep);
        }
    }
}
