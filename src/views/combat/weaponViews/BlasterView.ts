// src/views/combat/weaponViews/BlasterView.ts
import * as PIXI from 'pixi.js';

import fragmentShader from '../../../shaders/blaster.frag.glsl?raw';
import vertexShader from '../../../shaders/blaster.vert.glsl?raw';
import { AbstractWeaponView, type WeaponTransform } from './AbstractWeaponView';

export class BlasterView extends AbstractWeaponView {
    private readonly mesh: PIXI.Mesh<PIXI.MeshGeometry, PIXI.Shader>;
    private readonly uniforms: Record<string, any>;
    private readonly beamWidth = 400;
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

        // 2. Define uniform group matching the blaster shader requirements
        const uniformGroup = new PIXI.UniformGroup({
            uTime: { value: 0, type: 'f32' },
            uSize: { value: [this.beamWidth, this.currentHeight], type: 'vec2<f32>' },
            uBeamWidth: { value: 0.005, type: 'f32' },
            uBeamLength: { value: 0.4, type: 'f32' },
        });

        this.uniforms = uniformGroup.uniforms;

        // 3. Instantiate GlProgram and Shader
        const glProgram = new PIXI.GlProgram({
            vertex: vertexShader,
            fragment: fragmentShader,
            name: 'blaster-shader',
        });

        const shader = new PIXI.Shader({
            glProgram,
            resources: {
                blasterUniforms: uniformGroup,
            },
        });

        // 4. Instantiate Mesh and set additive blending
        this.mesh = new PIXI.Mesh({ geometry, shader });
        this.mesh.blendMode = 'add';

        this.addChild(this.mesh);
        this.visible = false;
    }

    public override update(delta: number): void {
        super.update(delta);
        if (this.visible) {
            // Drive animation uniform using view time
            this.uniforms.uTime = this.time;
        }
    }

    public updateWeapon(transform: WeaponTransform): void {
        this.x = transform.x;
        this.y = 0;

        console.log('Updating weapon with transform:', transform);

        this.currentHeight = Math.max(1, transform.y);

        const posBuffer = this.mesh.geometry.getBuffer('aPosition');
        const data = posBuffer.data as Float32Array;
        data[5] = this.currentHeight;
        data[7] = this.currentHeight;
        posBuffer.update();

        // Pass updated dimensions to shader
        this.uniforms.uSize = [20, 20]//[this.beamWidth, this.currentHeight];
    }

    public setWeaponActive(isActive: boolean): void {
        this.visible = isActive;
    }
}
