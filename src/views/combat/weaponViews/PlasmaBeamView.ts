// src/views/combat/weaponViews/PlasmaBeamView.ts
import * as PIXI from 'pixi.js';

import type { BalanceData } from '../../../data/types/BalanceData';
import plasmaFragment from '../../../shaders/plasmaBeam.frag.glsl?raw';
import meshVertexShader from '../../../shaders/plasmaBeam.vert.glsl?raw';
import type { IWeaponTransform } from './meta/IWeaponTransform';
import { type IWeaponView } from './meta/IWeaponView';
import type { WeaponBalance } from '../../../data/types/WeaponBalance';

export class PlasmaBeamView extends PIXI.Container implements IWeaponView {
    private mesh!: PIXI.Mesh<PIXI.MeshGeometry, PIXI.Shader>;
    private uniforms!: Record<string, any>;

    public readonly id = 'plasma_beam';

    private data: WeaponBalance;

    public time = 0;

    constructor(allData: BalanceData) {
        super();

        this.data = this.parseBalanceData(allData);
        this.initMesh();
    }

    private parseBalanceData(allData: BalanceData): WeaponBalance {
        return allData.weapons.find(weapon => weapon.id === this.id)!;
    }

    private initMesh(): void {
        const geometry = new PIXI.MeshGeometry({
            positions: new Float32Array([
                -this.data.projectile.width / 2, 0,
                this.data.projectile.width / 2, 0,
                this.data.projectile.width / 2, this.currentHeight,
                -this.data.projectile.width / 2, this.currentHeight
            ]),
            uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            indices: new Uint32Array([0, 1, 2, 0, 2, 3])
        });

        const uniformGroup = new PIXI.UniformGroup({
            uTime: { value: 0, type: 'f32' },
            uResolution: { value: [this.data.projectile.width, this.currentHeight], type: 'vec2<f32>' },
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

    public activateWeapon(): void {
        throw new Error('Method not implemented.');
    }

    public deactivateWeapon(): void {
        throw new Error('Method not implemented.');
    }

    public update(delta: number): void {
        this.time += delta;
        if (this.visible) {
            this.uniforms.uTime = this.time;
        }
    }

    public updateGeometry(transform: IWeaponTransform): void {
        this.x = transform.x;
        this.y = 0;

        this.currentHeight = Math.max(1, transform.y);

        const posBuffer = this.mesh.geometry.getBuffer('aPosition');
        const data = posBuffer.data as Float32Array;
        data[5] = this.currentHeight;
        data[7] = this.currentHeight;
        posBuffer.update();

        this.uniforms.uResolution = [this.data.projectile.width, this.currentHeight];
    }
}
