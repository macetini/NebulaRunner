import * as PIXI from 'pixi.js';

import plasmaFragment from '../../../shaders/plasmaBeam.frag.glsl?raw';
import meshVertexShader from '../../../shaders/plasmaBeam.vert.glsl?raw';
import { AbstractWeaponView, type WeaponTransform } from './AbstractWeaponView';

export class PlasmaBeamView extends AbstractWeaponView {
    private readonly mesh: PIXI.Mesh<PIXI.MeshGeometry, PIXI.Shader>;
    private readonly uniforms: Record<string, any>;
    private readonly beamWidth = 160;
    private currentHeight: number;

    constructor(screenHeight: number) {
        super();
        this.currentHeight = screenHeight;

        const geometry = new PIXI.MeshGeometry({
            positions: new Float32Array([
                -this.beamWidth / 2, 0,
                this.beamWidth / 2, 0,
                this.beamWidth / 2, this.currentHeight,
                -this.beamWidth / 2, this.currentHeight
            ]),
            uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            indices: new Uint32Array([0, 1, 2, 0, 2, 3])
        });

        const uniformGroup = new PIXI.UniformGroup({
            uTime: { value: 0, type: 'f32' },
            uResolution: { value: [this.beamWidth, this.currentHeight], type: 'vec2<f32>' },
            uCoreColor: { value: [1.0, 1.0, 1.0], type: 'vec3<f32>' },
            uAuraColor: { value: [0.95, 0.0, 0.55], type: 'vec3<f32>' },
        });

        this.uniforms = uniformGroup.uniforms;

        const glProgram = new PIXI.GlProgram({
            vertex: meshVertexShader,
            fragment: plasmaFragment,
        });

        const shader = new PIXI.Shader({
            glProgram,
            resources: {
                shaderUniforms: uniformGroup,
            },
        });

        this.mesh = new PIXI.Mesh({ geometry, shader });
        this.addChild(this.mesh);
    }

    public override update(delta: number): void {
        super.update(delta);
        if (this.visible) {
            this.uniforms.uTime = this.time;
        }
    }

    public updateWeapon(transform: WeaponTransform): void {
        this.x = transform.x;
        this.y = 0;

        this.currentHeight = Math.max(1, transform.y);

        const posBuffer = this.mesh.geometry.getBuffer('aPosition');
        const data = posBuffer.data as Float32Array;
        data[5] = this.currentHeight;
        data[7] = this.currentHeight;
        posBuffer.update();

        this.uniforms.uResolution = [this.beamWidth, this.currentHeight];
    }
}
