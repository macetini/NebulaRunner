import * as PIXI from 'pixi.js';
import plasmaFragment from '../shaders/plasmaBeam.frag.glsl?raw';

export class PlasmaBeamView extends PIXI.Container {
    private readonly filter: PIXI.Filter;
    private readonly beamSprite: PIXI.Sprite;
    private time = 0;
    private readonly beamWidth = 80;

    constructor(app: PIXI.Application) {
        super();

        this.filter = new PIXI.Filter({
            glProgram: new PIXI.GlProgram({
                vertex: PIXI.defaultFilterVert,
                fragment: plasmaFragment,
            }),
            resources: {
                shaderUniforms: {
                    uTime: { value: 0, type: 'f32' },
                    uResolution: { value: [this.beamWidth, app.screen.height], type: 'vec2<f32>' },
                    uCoreColor: { value: [1.0, 1.0, 1.0], type: 'vec3<f32>' },
                    uAuraColor: { value: [0.95, 0.0, 0.55], type: 'vec3<f32>' },
                },
            },
        });

        this.beamSprite = new PIXI.Sprite({
            texture: PIXI.Texture.WHITE,
            width: this.beamWidth,
            height: app.screen.height,
        });

        // Center horizontally
        this.beamSprite.anchor.set(0.5, 0.0);

        // Apply filter directly to the container
        this.filters = [this.filter];
        this.addChild(this.beamSprite);

        this.visible = false;
    }

    public setBeamActive(active: boolean): void {
        this.visible = active;
    }

    public update(delta: number): void {
        this.time += delta / 60;

        // Pixi v8 uniform update
        const uniforms = this.filter.resources.shaderUniforms.uniforms;
        uniforms.uTime = this.time;
    }

    public updateBeam(playerX: number, playerY: number, _delta: number): void {
        // Position container at ship X, extending from top of screen (0) down to ship Y
        this.x = playerX;
        this.y = 0;

        // Prevent height 0 rendering errors
        this.beamSprite.height = Math.max(1, playerY);
    }
}
