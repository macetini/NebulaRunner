import * as PIXI from 'pixi.js';
import { generateShieldTexture } from '../factories/BuffTextureFactory';
import { BuffType } from '../buffs/BuffType';
import { BuffView } from '../views/BuffView';

export class BuffPool {
    public readonly activeBuffs: BuffView[] = [];
    private readonly pool: BuffView[] = [];
    private readonly app: PIXI.Application;
    private readonly textures: Map<BuffType, PIXI.Texture>;

    constructor(app: PIXI.Application) {
        this.app = app;
        const rapidFireGraphics = new PIXI.Graphics()
            .circle(0, 0, 12)
            .fill(0xFFEE00)
            .stroke({ width: 2, color: 0xFFFFFF });
        this.textures = new Map([
            [BuffType.RAPID_FIRE, app.renderer.generateTexture(rapidFireGraphics)],
            [BuffType.SHIELD, generateShieldTexture(app)],
        ]);
    }

    public spawn(x: number, y: number, velocityY: number, type: BuffType): void {
        let buff = this.pool.find((candidate) => !candidate.visible);
        if (!buff) {
            buff = new BuffView(this.textures.get(type)!, type);
            this.pool.push(buff);
            this.app.stage.addChild(buff);
        }

        buff.setType(this.textures.get(type)!, type);
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
