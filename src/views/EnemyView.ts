import * as PIXI from 'pixi.js';
import type { EnemyType } from './types/EnemyType';
import type { EnemyProfile } from './types/EnemyProfile';
import type { GameConfig } from '../core/GameConfig';
import { EnemyTextureFactory } from '../factories/EnemyTextureFactory';
import { EnemyMovement } from '../movement/EnemyMovement';

export class EnemyView extends PIXI.Sprite {
    private profile: EnemyProfile;
    private health: number;
    private readonly textures: Map<EnemyType, PIXI.Texture>;
    private readonly movement: EnemyMovement;

    constructor(app: PIXI.Application, profile: EnemyProfile, config: GameConfig) {
        const textures = EnemyTextureFactory.getTextures(app);
        const texture = textures.get(profile.type)!;
        super(texture);

        this.profile = profile;
        this.health = profile.health;
        this.textures = textures;
        this.movement = new EnemyMovement(profile, config);
        this.visible = false;
        this.anchor.set(0.5);
    }

    public setProfile(profile: EnemyProfile): void {
        this.texture = this.textures.get(profile.type)!;
        this.profile = profile;
        this.health = profile.health;
        this.movement.setProfile(profile);
        this.alpha = 1;
    }

    public resetPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.movement.resetPosition(x, y);
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
        this.movement.update(delta, targetX);
        this.x = this.movement.x;
        this.y = this.movement.y;
    }
}