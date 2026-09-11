import * as PIXI from 'pixi.js';
import { BuffType } from '../buffs/BuffType';
import { BuffView } from '../views/BuffView';

export class BuffPool {
    public readonly activeBuffs: BuffView[] = [];
    private readonly pool: BuffView[] = [];
    private readonly app: PIXI.Application;
    private readonly texture: PIXI.Texture;

    constructor(app: PIXI.Application) {
        this.app = app;
        const graphics = new PIXI.Graphics()
            .circle(0, 0, 12)
            .fill(0xFFEE00)
            .stroke({ width: 2, color: 0xFFFFFF });
        this.texture = app.renderer.generateTexture(graphics);
    }

    public spawn(x: number, y: number, velocityY: number): void {
        let buff = this.pool.find((candidate) => !candidate.visible);
        if (!buff) {
            buff = new BuffView(this.texture, BuffType.RAPID_FIRE);
            this.pool.push(buff);
            this.app.stage.addChild(buff);
        }

        buff.resetPosition(x, y, velocityY);
        this.activeBuffs.push(buff);
    }

    public recycle(buff: BuffView, index: number): void {
        buff.visible = false;
        this.activeBuffs.splice(index, 1);
    }

    public clear(): void {
        for (const buff of this.activeBuffs) {
            buff.visible = false;
        }
        this.activeBuffs.length = 0;
    }
}
