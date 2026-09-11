import * as PIXI from 'pixi.js';
import type { EnemyType } from './types/EnemyType';
import type { EnemyProfile } from './types/EnemyProfile';
import type { GameConfig } from '../core/GameConfig';
import { EnemyTextureFactory } from '../factories/EnemyTextureFactory';

export class EnemyView extends PIXI.Sprite {
    private profile: EnemyProfile;
    private time: number = 0;
    private baseX: number = 0;
    private health: number;
    private readonly config: GameConfig;
    private readonly textures: Map<EnemyType, PIXI.Texture>;

    constructor(app: PIXI.Application, profile: EnemyProfile, config: GameConfig) {
        const textures = EnemyTextureFactory.getTextures(app);
        const texture = textures.get(profile.type)!;
        super(texture);

        this.profile = profile;
        this.health = profile.health;
        this.config = config;
        this.textures = textures;
        this.visible = false;
        this.anchor.set(0.5);
    }

    public setProfile(profile: EnemyProfile): void {
        this.texture = this.textures.get(profile.type)!;
        this.profile = profile;
        this.health = profile.health;
        this.alpha = 1;
    }

    public resetPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.time = 0;
    }

    public takeHit(): boolean {
        this.health -= 1;
        this.alpha = this.health > 0 ? 0.55 : 1;
        return this.health <= 0;
    }

    public get score(): number {
        return this.profile.score;
    }

    public updateMovement(delta: number, targetX: number): void {
        this.y += this.config.enemySpeed * delta * this.profile.speedMultiplier;

        if (this.profile.movement === 'sine') {
            this.time += this.config.enemySineOscillationSpeed * delta;
            this.x = this.baseX + Math.sin(this.time) * this.config.enemySineOscillationAmplitude;
        }
        if (this.profile.movement === 'chase') {
            const distance = targetX - this.x;
            const chaseStep = this.config.enemyChaseSpeed * delta;
            this.x += Math.sign(distance) * Math.min(Math.abs(distance), chaseStep);
        }
    }
}