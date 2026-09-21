import * as PIXI from 'pixi.js';
import { BuffType } from '../buffs/BuffType';
import { BuffTextureFactory } from '../factories/BuffTextureFactory';
import { BuffView } from '../views/BuffView';

export class BuffPool {
    public readonly activeBuffs: BuffView[] = [];
    private readonly pool: BuffView[] = [];
    private readonly app: PIXI.Application;
    private readonly textures: Map<BuffType, PIXI.Texture>;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.textures = new Map([
            [BuffType.RAPID_FIRE, BuffTextureFactory.generateRapidFireTexture(app)],
            [BuffType.SHIELD, BuffTextureFactory.generateShieldTexture(app)],
            [BuffType.EXPLOSION, BuffTextureFactory.generateExplosionTexture(app)],
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
