import * as PIXI from 'pixi.js';

export class Player {
    public view: PIXI.Sprite;
    private readonly speed: number = 6;
    private screenHeight: number;

    constructor(app: PIXI.Application) {
        this.screenHeight = app.screen.height;

        // 1. Create the programmatic shape
        const g = new PIXI.Graphics()
            .poly([25, 0, -15, -15, -5, 0, -15, 15])
            .fill(0x00FFFF)
            .stroke({ width: 2, color: 0xFFFFFF });

        // 2. Convert to texture for better performance
        const texture = app.renderer.generateTexture(g);

        this.view = new PIXI.Sprite(texture);
        this.view.anchor.set(0.5);
        this.view.x = 100;
        this.view.y = this.screenHeight / 2;
    }

    public update(delta: number, keys: Record<string, boolean>, currentScreenHeight: number) {
        this.screenHeight = currentScreenHeight;

        const moveStep = this.speed * delta;

        if (keys['ArrowUp'] || keys['KeyW']) {
            if (this.view.y - this.view.height / 2 >= 5) {
                this.view.y -= moveStep;
            }
        } else if (keys['ArrowDown'] || keys['KeyS']) {
            if (this.view.y + this.view.height / 2 <= this.screenHeight - 5) {
                this.view.y += moveStep;
            }
        }
    }

    public get position() {
        return { x: this.view.x, y: this.view.y };
    }
}