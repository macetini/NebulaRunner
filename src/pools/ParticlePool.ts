import * as PIXI from 'pixi.js';
import type { GameConfig } from '../core/GameConfig';
import { ParticleView } from '../views/ParticleView';

export class ParticlePool {
    public readonly activeParticles: ParticleView[] = [];
    private readonly pool: ParticleView[] = [];
    private readonly app: PIXI.Application;
    private readonly config: GameConfig;
    private readonly sharedTexture: PIXI.Texture;

    constructor(app: PIXI.Application, config: GameConfig) {
        this.app = app;
        this.config = config;

        // Generate a simple 3x3 procedural square texture to share across all particles
        const g = new PIXI.Graphics()
            .rect(0, 0, 3, 3)
            .fill(0xFFFFFF);
        this.sharedTexture = app.renderer.generateTexture(g);
    }

    /**
     * Spawns a burst of particles at the specified location.
     */
    public spawnExplosion(x: number, y: number, color: number, countOverride?: number): void {
        const count = countOverride !== undefined ? countOverride : this.config.particleCountPerExplosion;

        for (let i = 0; i < count; i++) {
            let particle = this.pool.find(p => !p.visible);

            if (!particle) {
                particle = new ParticleView(this.sharedTexture);
                this.pool.push(particle);
                this.app.stage.addChild(particle);
            }

            // Assign a random angle and speed
            const angle = Math.random() * Math.PI * 2;
            const speed = this.config.particleMinSpeed + Math.random() * (this.config.particleMaxSpeed - this.config.particleMinSpeed);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const lifetime = this.config.particleMinLifetime + Math.random() * (this.config.particleMaxLifetime - this.config.particleMinLifetime);

            particle.init(x, y, vx, vy, lifetime, color);
            this.activeParticles.push(particle);
        }
    }

    /**
     * Recycles a single particle.
     */
    public recycle(particle: ParticleView, index: number): void {
        particle.visible = false;
        this.activeParticles.splice(index, 1);
    }

    /**
     * Clears all active particles.
     */
    public clear(): void {
        for (const particle of this.activeParticles) {
            particle.visible = false;
        }
        this.activeParticles.length = 0;
    }
}
