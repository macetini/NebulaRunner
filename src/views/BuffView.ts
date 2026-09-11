import * as PIXI from 'pixi.js';
import { GlowEffectFactory } from '../effects/GlowEffectFactory';
import type { BuffType } from '../buffs/BuffType';

export class BuffView extends PIXI.Sprite {
    public readonly type: BuffType;
    public velocityY = 0;

    constructor(texture: PIXI.Texture, type: BuffType) {
        super(texture);
        this.type = type;
        this.anchor.set(0.5);
        this.filters = [GlowEffectFactory.createBuff()];
        this.visible = false;
    }

    public resetPosition(x: number, y: number, velocityY: number): void {
        this.position.set(x, y);
        this.velocityY = velocityY;
        this.visible = true;
    }

    public update(delta: number): void {
        this.y += this.velocityY * delta;
    }
}
