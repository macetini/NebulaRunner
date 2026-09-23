import * as PIXI from 'pixi.js';

export class ParticleView extends PIXI.Sprite {
    public velocityX: number = 0;
    public velocityY: number = 0;
    public lifetime: number = 0;
    public age: number = 0;

    constructor(texture: PIXI.Texture) {
        super(texture);
        this.anchor.set(0.5);
    }

    public init(x: number, y: number, vx: number, vy: number, lifetime: number, color: number): void {
        this.x = x;
        this.y = y;
        this.velocityX = vx;
        this.velocityY = vy;
        this.lifetime = lifetime;
        this.age = 0;
        this.alpha = 1;
        this.tint = color;
        this.visible = true;
    }

    public update(delta: number): boolean {
        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;
        this.age += delta;

        // Fade out as it nears its lifetime limit
        const progress = this.age / this.lifetime;
        this.alpha = Math.max(0, 1 - progress);

        if (this.age >= this.lifetime) {
            this.visible = false;
            return true; // Finished
        }
        return false; // Still active
    }
}
