import * as PIXI from 'pixi.js';
import { EnemyType } from './types/EnemyType';

export class EnemyView extends PIXI.Sprite {
    private static readonly TEXTURES: Map<EnemyType, PIXI.Texture> = new Map();
    private readonly SPEED: number = 4;
    private readonly OSCILLATION_SPEED: number = 0.1;
    private readonly OSCILLATION_AMPLITUDE: number = 10;

    private enemyType: EnemyType;
    private time: number = 0;

    constructor(app: PIXI.Application, type: EnemyType) {
        EnemyView.initStaticTextures(app);

        const texture = EnemyView.TEXTURES.get(type)!;
        super(texture);

        this.enemyType = type;
        this.visible = false;
        this.anchor.set(0.5);
    }

    public setType(type: EnemyType): void {
        this.texture = EnemyView.TEXTURES.get(type)!;
        this.enemyType = type;
    }

    private static initStaticTextures(app: PIXI.Application): void {
        if (EnemyView.TEXTURES.size > 0) return; // Already initialized

        const g = new PIXI.Graphics();
        // Red Diamond
        g.clear().poly([15, 0, 0, 15, -15, 0, 0, -15]).fill(0xFF3333);
        EnemyView.TEXTURES.set(EnemyType.DIAGONAL, app.renderer.generateTexture(g));
        // Purple Triangle
        g.clear().poly([15, 0, -15, -15, -15, 15]).fill(0xAA33FF);
        EnemyView.TEXTURES.set(EnemyType.SINE, app.renderer.generateTexture(g));
    }

    public updateMovement(delta: number): void {
        const speedBoost: number = this.enemyType === EnemyType.DIAGONAL ? 1.5 : 1;
        this.x -= this.SPEED * delta * speedBoost;

        if (this.enemyType === EnemyType.SINE) {
            this.time += this.OSCILLATION_SPEED * delta;
            this.y = this.y + Math.sin(this.time) * this.OSCILLATION_AMPLITUDE;
        }
    }
}