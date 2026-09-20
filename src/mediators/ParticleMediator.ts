import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';
import type { ParticlePool } from '../pools/ParticlePool';

export class ParticleMediator implements IContextItem {
    private readonly pool: ParticlePool;

    constructor(pool: ParticlePool, signalBus: SignalBus) {
        this.pool = pool;

        // Listen for enemy defeat to trigger explosive visual particles
        signalBus.addEventListener(GameSignals.ENEMY_DIED, (event) => {
            const data = (event as CustomEvent<{ x: number; y: number; defeated: boolean; color?: number }>).detail;

            const color = data.color !== undefined ? data.color : 0xFFFFFF;
            if (data.defeated) {
                this.pool.spawnExplosion(data.x, data.y, color);
            } else {
                // Spawn a tiny hit flash (4 particles) if they just took a hit but didn't die
                this.pool.spawnExplosion(data.x, data.y, color, 4);
            }
        });

        signalBus.addEventListener(GameSignals.PLAYER_DIED, (event) => {
            const data = (event as CustomEvent<{ x: number; y: number }>).detail;
            const x = data?.x !== undefined ? data.x : 225; // fallback to center if coordinates not passed
            const y = data?.y !== undefined ? data.y : 600;
            this.pool.spawnExplosion(x, y, 0x00FFFF);
        });

        signalBus.addEventListener(GameSignals.RUN_RESTARTED, () => {
            this.pool.clear();
        });
    }

    public update(delta: number): void {
        const particles = this.pool.activeParticles;
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            const isFinished = particle.update(delta);
            if (isFinished) {
                this.pool.recycle(particle, i);
            }
        }
    }
}
