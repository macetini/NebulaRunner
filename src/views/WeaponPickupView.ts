import * as PIXI from 'pixi.js';
import { GlowEffectFactory } from '../factories/GlowEffectFactory';

export class WeaponPickupView extends PIXI.Container {
    public weaponId: string;
    public velocityX = 0;
    public velocityY = 0;
    private readonly aura: PIXI.Graphics;
    private readonly sprite: PIXI.Sprite;
    private baseY = 0;
    private phase = 0;
    private animationTime = 0;

    constructor(texture: PIXI.Texture, weaponId: string) {
        super();
        this.weaponId = weaponId;

        this.aura = new PIXI.Graphics()
            .circle(0, 0, 20)
            .stroke({ width: 2, color: 0x00F0FF, alpha: 0.4 });
        this.aura.alpha = 0.35;

        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);

        this.addChild(this.aura, this.sprite);
        this.setTexture(texture, weaponId);
        this.visible = false;
    }

    public setTexture(texture: PIXI.Texture, weaponId: string): void {
        this.sprite.texture = texture;
        this.weaponId = weaponId;
        this.filters = [GlowEffectFactory.createBuff(0x00F0FF)];
        this.aura.tint = 0x00F0FF;
    }

    public resetPosition(x: number, y: number, velocityY: number): void {
        this.position.set(x, y);
        this.baseY = y;
        this.velocityX = 0;
        this.velocityY = velocityY;
        this.phase = Math.random() * Math.PI * 2;
        this.animationTime = 0;
        this.scale.set(1);
        this.alpha = 1;
        this.aura.scale.set(1);
        this.aura.alpha = 0.35;
        this.visible = true;
    }

    public update(delta: number): void {
        this.x += this.velocityX * delta;
        this.baseY += this.velocityY * delta;
        this.animationTime += delta * 0.08;
        this.y = this.baseY + Math.sin(this.phase + this.animationTime) * 3;

        const pulse = 0.95 + (Math.sin(this.phase + this.animationTime * 1.5) + 1) * 0.05;
        this.sprite.scale.set(pulse);

        const auraPulse = 1 + (Math.sin(this.phase + this.animationTime * 2) + 1) * 0.15;
        this.aura.scale.set(auraPulse);
        this.aura.alpha = 0.2 + (Math.sin(this.phase + this.animationTime * 2) + 1) * 0.05;
    }
}
