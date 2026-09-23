import * as PIXI from 'pixi.js';
import plasmaFragment from '../shaders/plasmaBeam.frag.glsl?raw';
import meshVertexShader from '../shaders/plasmaBeam.vert.glsl?raw';

export class PlasmaBeamView extends PIXI.Container {
    private readonly mesh: PIXI.Mesh<PIXI.MeshGeometry, PIXI.Shader>;
    private readonly uniforms: Record<string, any>;
    private time = 0;
    private readonly beamWidth = 160;
    private currentHeight: number;

    constructor(app: PIXI.Application) {
        super();

        this.currentHeight = app.screen.height;

        // 1. Quad geometry with normalized UVs (0 to 1) and Uint32Array indices.
        // Bottom two vertices (indices 2 & 3) get their Y rewritten directly in
        // updateBeam() rather than going through Container's height/scale setter.
        const geometry = new PIXI.MeshGeometry({
            positions: new Float32Array([
                -this.beamWidth / 2, 0,                  // 0: Top-Left
                this.beamWidth / 2, 0,                  // 1: Top-Right
                this.beamWidth / 2, this.currentHeight, // 2: Bottom-Right
                -this.beamWidth / 2, this.currentHeight  // 3: Bottom-Left
            ]),
            uvs: new Float32Array([
                0, 0, // Top-Left
                1, 0, // Top-Right
                1, 1, // Bottom-Right
                0, 1  // Bottom-Left
            ]),
            indices: new Uint32Array([0, 1, 2, 0, 2, 3])
        });

        // 2. Uniforms setup
        const uniformGroup = new PIXI.UniformGroup({
            uTime: { value: 0, type: 'f32' },
            uResolution: { value: [this.beamWidth, this.currentHeight], type: 'vec2<f32>' },
            uCoreColor: { value: [1.0, 1.0, 1.0], type: 'vec3<f32>' },
            uAuraColor: { value: [0.95, 0.0, 0.55], type: 'vec3<f32>' },
        });

        this.uniforms = uniformGroup.uniforms;

        // 3. Create Shader using explicit mesh vertex shader
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

        // 4. Instantiate Mesh
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

    public update(delta: number): void {
        this.time += delta / 60;
        this.uniforms.uTime = this.time;
    }

    public updateBeam(playerX: number, playerY: number, _delta: number): void {
        this.x = playerX;
        this.y = 0;

        this.currentHeight = Math.max(1, playerY - 35);

        // Write the bottom two vertices' Y directly instead of driving
        // this.mesh.height (which triggers a getLocalBounds() pass every call).
        const posBuffer = this.mesh.geometry.getBuffer('aPosition');
        const data = posBuffer.data as Float32Array;
        data[5] = this.currentHeight; // vertex 2 (Bottom-Right) y
        data[7] = this.currentHeight; // vertex 3 (Bottom-Left) y
        posBuffer.update();

        // Keep the shader's notion of beam height in sync so the turbulence
        // pattern doesn't stretch/compress as the beam grows or shrinks.
        this.uniforms.uResolution = [this.beamWidth, this.currentHeight];
    }

    public destroy(options?: PIXI.DestroyOptions): void {
        this.mesh.geometry.destroy();
        this.mesh.shader?.destroy();
        super.destroy(options);
    }
}
