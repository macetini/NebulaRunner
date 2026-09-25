import * as PIXI from 'pixi.js';
import type { GameConfig } from '../../core/game/GameConfig';
import { GlowEffectFactory } from '../../factories/GlowEffectFactory';
import { PlayerTextureFactory } from '../../factories/PlayerTextureFactory';
import { PlayerShieldView } from '../combat/PlayerShieldView';

export class PlayerView extends PIXI.Container {
    // Consts
    private readonly BOUND_BUFFER: number = 5;

    private readonly app: PIXI.Application;
    private readonly config: GameConfig;
    private readonly playerSprite: PIXI.Sprite;
    private readonly shield: PlayerShieldView;
    private movementSpeedMultiplier = 1;
    private boostRemaining = 0;
    private boostCharge: number;

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
        this.boostCharge = config.boostMaximumCharge;
    }

    public override get width(): number {
        return this.playerSprite.width;
    }

    public override set width(value: number) {
        this.playerSprite.width = value;
    }

    public override get height(): number {
        return this.playerSprite.height;
    }

    public override set height(value: number) {
        this.playerSprite.height = value;
    }

    public resetPosition(): void {
        this.x = this.app.screen.width * 0.5;
        this.y = this.config.playerInitialY;
        this.boostRemaining = 0;
        this.boostCharge = this.config.boostMaximumCharge;
        this.movementSpeedMultiplier = 1;
        this.playerSprite.scale.set(1);
    }

    public get movementSpeedMultiplierValue(): number {
        return this.movementSpeedMultiplier;
    }

    public get boostActive(): boolean {
        return this.boostRemaining > 0;
    }

    public get boostChargeValue(): number {
        return this.boostCharge;
    }

    public get boostMaximumCharge(): number {
        return this.config.boostMaximumCharge;
    }

    public tryBoost(): boolean {
        if (this.boostActive) {// || this.boostCharge < this.config.boostMaximumCharge) {
            return false;
        }

        this.boostRemaining = this.config.boostDuration;
        this.boostCharge = 0;
        this.movementSpeedMultiplier = this.config.boostSpeedMultiplier;
        return true;
    }

    public rechargeBoost(): void {
        this.boostCharge = Math.min(
            this.config.boostMaximumCharge,
            this.boostCharge + this.config.boostChargePerEnemy,
        );
    }

    public updateBoost(delta: number): void {
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
