import * as PIXI from 'pixi.js';

export class PlayerView extends PIXI.Sprite {
    // Consts
    private readonly SPEED: number = 6;
    private readonly BOUND_BUFFER: number = 5;

    private readonly app: PIXI.Application;

    constructor(app: PIXI.Application) {
        const g = new PIXI.Graphics()
            .poly([0, -25, 15, 15, 0, 5, -15, 15])
            .fill(0x00FFFF)
            .stroke({ width: 2, color: 0xFFFFFF });

        const texture = app.renderer.generateTexture(g);
        super(texture);

        this.anchor.set(0.5);

        this.x = app.screen.width * 0.5;
        this.y = app.screen.height - this.height * 2;

        this.app = app;
    }

    public resetPosition(): void {
        this.x = this.app.screen.width * 0.5;
        this.y = this.app.screen.height - this.height * 2;
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
        return this.SPEED * delta;
    }
}