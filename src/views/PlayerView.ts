import * as PIXI from 'pixi.js';

export class PlayerView extends PIXI.Sprite {
    // Consts
    private readonly SPEED: number = 6;
    private readonly INIT_Y_POS: number = 100;
    private readonly BOUND_BUFFER: number = 5;

    private readonly owner: PIXI.Application;

    constructor(app: PIXI.Application) {
        const g = new PIXI.Graphics()
            .poly([25, 0, -15, -15, -5, 0, -15, 15])
            .fill(0x00FFFF)
            .stroke({ width: 2, color: 0xFFFFFF });

        const texture = app.renderer.generateTexture(g);
        super(texture);

        this.anchor.set(0.5);

        this.x = this.INIT_Y_POS;
        this.y = app.screen.height * 0.5 - this.height * 0.5;

        this.owner = app;
    }

    public moveUp(delta: number): void {
        if (this.y - this.height * 0.5 >= this.BOUND_BUFFER) {
            this.y -= this.getMoveStep(delta);
        }
    }

    public moveDown(delta: number): void {
        if (this.y + this.height * 0.5 <= this.owner.screen.height - this.BOUND_BUFFER) {
            this.y += this.getMoveStep(delta);
        }
    }

    private getMoveStep(delta: number): number {
        return this.SPEED * delta;
    }
}