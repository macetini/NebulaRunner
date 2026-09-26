// src/views/combat/weaponViews/BlasterView.ts
import * as PIXI from 'pixi.js';
import fragmentShader from '../../../shaders/blaster.frag.glsl?raw';
import vertexShader from '../../../shaders/blaster.vert.glsl?raw';

import type { BalanceData } from '../../../data/types/BalanceData';
import type { WeaponBalance } from '../../../data/types/WeaponBalance';
import { TrajectoryRegistry } from '../../../projectiles/trajectories/TrajectoryRegistry';
import { type IWeaponView } from './meta/IWeaponView';

interface IBoltInstance {
    mesh: PIXI.Mesh<PIXI.MeshGeometry, PIXI.Shader>;
    uniformGroup: PIXI.UniformGroup;
    active: boolean;
    x: number;
    y: number;
}

export class BlasterView extends PIXI.Container implements IWeaponView {
    private sharedGeometry!: PIXI.MeshGeometry;
    private sharedGlProgram!: PIXI.GlProgram;

    private readonly pool: IBoltInstance[] = [];

    private spawnTimer = 0;
    private muzzlePosition: PIXI.Point = new PIXI.Point();

    private data: WeaponBalance;

    private isFiring = false;

    public id = 'blaster';
    public time = 0;

    constructor(allData: BalanceData) {
        super();
        console.log('Constructing BlasterView');

        this.data = allData.weapons.find(weapon => weapon.id === this.id)!;

        this.initSharedResources();

        // Pre-warm pool of bolt meshes
        for (let i = 0; i < 15; i++) {
            this.pool.push(this.createBoltInstance());
        }
    }

    private initSharedResources(): void {
        const hw = this.data.projectile.width / 2;
        const hh = (this.data.projectile.height ?? 10) / 2;

        this.sharedGeometry = new PIXI.MeshGeometry({
            positions: new Float32Array([
                -hw, -hh,
                hw, -hh,
                hw, hh,
                -hw, hh
            ]),
            uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
            indices: new Uint32Array([0, 1, 2, 0, 2, 3])
        });

        this.sharedGlProgram = new PIXI.GlProgram({
            vertex: vertexShader,
            fragment: fragmentShader,
            name: 'blaster-bolt-shader',
        });
    }

    public setMuzzlePosition(x: number, y: number): void {
        this.muzzlePosition.x = x;
        this.muzzlePosition.y = y;
    }

    private createBoltInstance(): IBoltInstance {
        const uniformGroup = new PIXI.UniformGroup({
            uTime: { value: 0, type: 'f32' },
            uSize: {
                value: [
                    this.data.projectile.width,
                    this.data.projectile.height ?? 10],
                type: 'vec2<f32>'
            },
            uBeamWidth: { value: 0.12, type: 'f32' },
            uBeamLength: { value: 1.0, type: 'f32' },
        });

        const shader = new PIXI.Shader({
            glProgram: this.sharedGlProgram,
            resources: {
                blasterUniforms: uniformGroup,
            },
        });

        const mesh = new PIXI.Mesh({ geometry: this.sharedGeometry, shader });
        mesh.blendMode = 'add';
        mesh.visible = false;
        this.addChild(mesh);

        return { mesh, uniformGroup, active: false, x: 0, y: 0 };
    }

    public activateWeapon(): void {
        console.log('Activating Blaster Weapon');
        this.isFiring = this.visible = true;
    }

    public deactivateWeapon(): void {
        console.log('Deactivating Blaster Weapon');
        this.isFiring = this.visible = false;
        this.spawnTimer = 0;

        // Reset active bolts in pool
        for (const bolt of this.pool) {
            bolt.active = false;
            bolt.mesh.visible = false;
        }
    }

    public update(delta: number): void {
        const dt = delta / 60;
        this.time += dt;

        if (this.isFiring) {
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.data.fireCooldown) {
                this.spawnTimer = 0;
                this.spawnBolt(this.muzzlePosition.x, this.muzzlePosition.y);
            }
        }

        const straightStrategy = TrajectoryRegistry.getStrategy('straight');

        for (const bolt of this.pool) {
            if (!bolt.active) continue;

            bolt.uniformGroup.uniforms.uTime = this.time;

            const nextPos = straightStrategy.calculateNextPosition(
                {
                    x: bolt.x,
                    y: bolt.y,
                    vx: this.data.projectile.vx ?? 0,
                    vy: this.data.projectile.vy ?? 0,
                },
                delta
            );

            bolt.x = nextPos.x;
            bolt.y = nextPos.y;

            bolt.mesh.x = bolt.x;
            bolt.mesh.y = bolt.y;

            // Recycle bolt if it moves off-screen (adjust bounds to your game screen size)
            if (bolt.y + bolt.mesh.height / 2 < 0) {
                bolt.active = false;
                bolt.mesh.visible = false;
            }
        }
    }

    private spawnBolt(startX: number, startY: number): void {
        let bolt = this.pool.find(b => !b.active);
        if (!bolt) {
            bolt = this.createBoltInstance();
            this.pool.push(bolt);
        }

        bolt.active = true;
        bolt.x = startX;
        bolt.y = startY;

        bolt.mesh.x = startX;
        bolt.mesh.y = startY;
        bolt.mesh.visible = true;
    }
}
