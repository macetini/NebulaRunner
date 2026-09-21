import * as PIXI from 'pixi.js';
import type { GameConfig } from '../core/GameConfig';
import backgroundFragment from '../shaders/background.frag.glsl?raw';
import backgroundVertex from '../shaders/background.vert.glsl?raw';

export class BackgroundView extends PIXI.Container {
    private readonly shaderFilter: PIXI.Filter;
    private readonly shaderSprite: PIXI.Sprite;
    private readonly backgroundSpeed: number;
    private movementSpeed = 1;

    private nebulaTime = 0;

    constructor(app: PIXI.Application, config: GameConfig) {
        super();
        this.backgroundSpeed = config.backgroundSpeed;

        this.shaderFilter = new PIXI.Filter({
            glProgram: new PIXI.GlProgram({
                vertex: backgroundVertex,
                fragment: backgroundFragment,
            }),
            resources: {
                shaderUniforms: {
                    uTime: { value: 0, type: 'f32' },
                    uOffset: { value: [0, 0], type: 'vec2<f32>' },
                    uResolutionAspect: { value: [app.screen.width / app.screen.height, 1.0], type: 'vec2<f32>' },
                    uResolution: { value: [app.screen.width, app.screen.height], type: 'vec2<f32>' },
                    uMovementSpeed: { value: 1, type: 'f32' },
                    uTransformProgress: { value: 0, type: 'f32' },
                },
            },
        });

        this.shaderSprite = new PIXI.Sprite({
            texture: PIXI.Texture.WHITE,
            width: app.screen.width,
            height: app.screen.height,
        });

        this.shaderSprite.filters = [this.shaderFilter];
        this.addChild(this.shaderSprite);
    }

    public resize(width: number, height: number): void {
        this.shaderSprite.width = width;
        this.shaderSprite.height = height;

        const safeWidth = width || 1;
        const safeHeight = height || 1;

        const uniforms = this.shaderFilter.resources.shaderUniforms.uniforms;
        uniforms.uResolutionAspect = [safeWidth / safeHeight, 1.0];
        uniforms.uResolution = [safeWidth, safeHeight];
    }

    public moveDown(delta: number): void {
        // Wrap nebulaTime at 1000 to maintain mediump float precision over long play sessions
        this.nebulaTime = (this.nebulaTime + (delta / 60) * (this.backgroundSpeed / 3)) % 1000;

        const width = this.shaderSprite.width || 1;
        const height = this.shaderSprite.height || 1;

        const aspectRatio = height / width;
        const portraitSpeedMultiplier = Math.max(1.0, Math.min(aspectRatio * 1.8, 3.0));

        const baseVerticalSpeed = this.nebulaTime * 0.45 * portraitSpeedMultiplier;

        const uniforms = this.shaderFilter.resources.shaderUniforms.uniforms;
        uniforms.uTime = this.nebulaTime;
        uniforms.uOffset = [0, baseVerticalSpeed];
        uniforms.uMovementSpeed = this.movementSpeed;
    }

    public setMovementSpeed(speed: number): void {
        this.movementSpeed = Math.max(0, speed);
    }
}
