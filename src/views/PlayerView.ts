import * as PIXI from 'pixi.js';

import type { GameConfig } from '../core/GameConfig';
import { GlowEffectFactory } from '../effects/GlowEffectFactory';
import { PlayerShieldView } from './PlayerShieldView';
import { PlayerTextureFactory } from '../factories/PlayerTextureFactory';

export class PlayerView extends PIXI.Container {
    // Consts
    private readonly BOUND_BUFFER: number = 5;

    private readonly app: PIXI.Application;
    private readonly config: GameConfig;
    private readonly playerSprite: PIXI.Sprite;
    private readonly shield: PlayerShieldView;
    private movementSpeedMultiplier = 1;
    private boostRemaining = 0;
    private boostCooldownRemaining = 0;

    constructor(app: PIXI.Application, config: GameConfig) {
        const texture = PlayerTextureFactory.createPlayerTexture(app);
        super();

        this.playerSprite = new PIXI.Sprite(texture);
        this.playerSprite.anchor.set(0.5);
        this.filters = [GlowEffectFactory.createPlayer()];
        this.addChild(this.playerSprite);

        this.shield = new PlayerShieldView();
        this.addChild(this.shield);

        this.x = app.screen.width * 0.5;
        this.y = config.playerInitialY;

        this.app = app;
        this.config = config;
    }

    public override get width(): number {
        return this.playerSprite.width;
    }

    public override set width(value: number) {
        this.playerSprite.width = value;
    }

    public resetPosition(): void {
        this.x = this.app.screen.width * 0.5;
        this.y = this.config.playerInitialY;
        this.boostRemaining = 0;
        this.boostCooldownRemaining = 0;
        this.movementSpeedMultiplier = 1;
        this.playerSprite.scale.set(1);
    }

    public get movementSpeedMultiplierValue(): number {
        return this.movementSpeedMultiplier;
    }

    public get boostActive(): boolean {
        return this.boostRemaining > 0;
    }

    public tryBoost(): boolean {
        if (this.boostActive || this.boostCooldownRemaining > 0) {
            return false;
        }

        this.boostRemaining = this.config.boostDuration;
        this.boostCooldownRemaining = this.config.boostCooldown;
        this.movementSpeedMultiplier = this.config.boostSpeedMultiplier;
        return true;
    }

    public updateBoost(delta: number): void {
        this.boostCooldownRemaining = Math.max(0, this.boostCooldownRemaining - delta);
        if (!this.boostActive) {
            return;
        }

        this.boostRemaining = Math.max(0, this.boostRemaining - delta);
        const progress = 1 - this.boostRemaining / this.config.boostDuration;
        const boostOffset = Math.sin(progress * Math.PI);
        this.y = this.config.playerInitialY - boostOffset * this.config.boostDistance;
        this.playerSprite.scale.set(1 + boostOffset * 0.15);

        if (this.boostRemaining === 0) {
            this.y = this.config.playerInitialY;
            this.playerSprite.scale.set(1);
            this.movementSpeedMultiplier = 1;
        }
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
