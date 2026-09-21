import * as PIXI from 'pixi.js';
import { BuffType, type BuffType as BuffTypeValue } from '../buffs/BuffType';
import { GlowEffectFactory } from '../effects/GlowEffectFactory';

export class BuffView extends PIXI.Container {
    public type: BuffTypeValue;
    public velocityX = 0;
    public velocityY = 0;
    private readonly aura: PIXI.Graphics;
    private readonly sprite: PIXI.Sprite;
    private baseY = 0;
    private phase = 0;
    private animationTime = 0;

    constructor(texture: PIXI.Texture, type: BuffTypeValue) {
        super();
        this.type = type;
        this.aura = new PIXI.Graphics()
            .circle(0, 0, 25)
            .stroke({ width: 2, color: 0xFFFFFF, alpha: 0.3 });
        this.aura.alpha = 0.3;
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.addChild(this.aura, this.sprite);
        this.setType(texture, type);
        this.visible = false;
    }

    public setType(texture: PIXI.Texture, type: BuffTypeValue): void {
        this.sprite.texture = texture;
        this.type = type;
        const color = type === BuffType.SHIELD
            ? 0x55CCFF
            : type === BuffType.EXPLOSION ? 0xFF6633 : 0xFFEE00;
        this.filters = [GlowEffectFactory.createBuff(color)];
        this.aura.tint = color;
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
        this.aura.alpha = 0.3;
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
