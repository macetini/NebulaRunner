import * as PIXI from 'pixi.js';
import plasmaFragment from '../../shaders/plasmaBeam.frag.glsl?raw';
import meshVertexShader from '../../shaders/plasmaBeam.vert.glsl?raw';

export class PlasmaBeamView extends PIXI.Container {
    private readonly mesh: PIXI.Mesh<PIXI.MeshGeometry, PIXI.Shader>;
    private readonly uniforms: Record<string, any>;
    private time = 0;
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
            uvs: new Float32Array([
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ]),
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

        this.mesh = new PIXI.Mesh({
            geometry,
            shader,
        });

        this.addChild(this.mesh);
        this.visible = false;
    }

    public setBeamActive(active: boolean): void {
        this.visible = active;
    }

    public setWeaponActive(active: boolean): void {
        this.setBeamActive(active);
    }

    public update(delta: number): void {
        this.time += delta / 60;
        this.uniforms.uTime = this.time;
    }

    public updateBeam(playerX: number, playerY: number, _delta: number): void {
        this.x = playerX;
        this.y = 0;

        this.currentHeight = Math.max(1, playerY - 35);

        const posBuffer = this.mesh.geometry.getBuffer('aPosition');
        const data = posBuffer.data as Float32Array;
        data[5] = this.currentHeight;
        data[7] = this.currentHeight;
        posBuffer.update();

        this.uniforms.uResolution = [this.beamWidth, this.currentHeight];
    }

    public destroy(options?: PIXI.DestroyOptions): void {
        this.mesh.geometry.destroy();
        this.mesh.shader?.destroy();
        super.destroy(options);
    }
}
