import * as PIXI from 'pixi.js';

import type { GameConfig } from '../core/GameConfig';
import { GlowEffectFactory } from '../effects/GlowEffectFactory';
import { PlayerShieldView } from './PlayerShieldView';
import { PlayerTextureFactory } from '../factories/PlayerTextureFactory';

export class PlayerView extends PIXI.Sprite {
    // Consts
    private readonly BOUND_BUFFER: number = 5;

    private readonly app: PIXI.Application;
    private readonly config: GameConfig;
    private readonly shield: PlayerShieldView;
    private movementSpeedMultiplier = 1;

    constructor(app: PIXI.Application, config: GameConfig) {
        const texture = PlayerTextureFactory.createPlayerTexture(app);
        super(texture);

        this.anchor.set(0.5);
        this.filters = [GlowEffectFactory.createPlayer()];
        this.shield = new PlayerShieldView();
        this.addChild(this.shield);

        this.x = app.screen.width * 0.5;
        this.y = config.playerInitialY;

        this.app = app;
        this.config = config;
    }

    public resetPosition(): void {
        this.x = this.app.screen.width * 0.5;
        this.y = this.config.playerInitialY;
    }

    public get movementSpeedMultiplierValue(): number {
        return this.movementSpeedMultiplier;
    }

    public setShieldActive(active: boolean): void {
        this.shield.setActive(active);
    }

    public triggerShieldHit(): void {
        this.shield.triggerHitResponse();
    }

    public updateShield(delta: number): void {
        this.shield.update(delta);
    }

    public resetShield(): void {
        this.shield.reset();
    }

    public moveLeft(delta: number): void {
        if (this.x - this.width * 0.5 >= this.BOUND_BUFFER) {
            const minimumX = this.BOUND_BUFFER + this.width * 0.5;
            this.x = Math.max(minimumX, this.x - this.getMoveStep(delta));
        }
    }

    public moveRight(delta: number): void {
        if (this.x + this.width * 0.5 <= this.app.screen.width - this.BOUND_BUFFER) {
            const maximumX = this.app.screen.width - this.BOUND_BUFFER - this.width * 0.5;
            this.x = Math.min(maximumX, this.x + this.getMoveStep(delta));
        }
    }

    public moveToward(targetX: number, delta: number): void {
        const distance = targetX - this.x;
        if (Math.abs(distance) <= this.BOUND_BUFFER) {
            return;
        }

        if (distance < 0) {
            this.moveLeft(delta);
        } else {
            this.moveRight(delta);
        }
    }

    private getMoveStep(delta: number): number {
        return this.config.playerSpeed * this.movementSpeedMultiplier * delta;
    }
}
