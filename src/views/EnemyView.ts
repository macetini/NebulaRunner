import * as PIXI from 'pixi.js';
import { EnemyType } from './types/EnemyType';
import type { GameConfig } from '../core/GameConfig';

export class EnemyView extends PIXI.Sprite {
    private static readonly TEXTURES: Map<EnemyType, PIXI.Texture> = new Map();
    private enemyType: EnemyType;
    private time: number = 0;
    private baseX: number = 0;
    private readonly config: GameConfig;

    constructor(app: PIXI.Application, type: EnemyType, config: GameConfig) {
        EnemyView.initStaticTextures(app);

        const texture = EnemyView.TEXTURES.get(type)!;
        super(texture);

        this.enemyType = type;
        this.config = config;
        this.visible = false;
        this.anchor.set(0.5);
    }

    public setType(type: EnemyType): void {
        this.texture = EnemyView.TEXTURES.get(type)!;
        this.enemyType = type;
    }

    public resetPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.time = 0;
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
        this.y += this.config.enemySpeed * delta * speedBoost;

        if (this.enemyType === EnemyType.SINE) {
            this.time += this.config.enemySineOscillationSpeed * delta;
            this.x = this.baseX + Math.sin(this.time) * this.config.enemySineOscillationAmplitude;
        }
    }
}