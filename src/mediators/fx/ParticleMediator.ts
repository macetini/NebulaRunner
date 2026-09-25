import type { IContextItem } from "../../core/context/meta/IContextItem";
import { GameSignals } from "../../core/game/GameSignals";
import type { SignalBus } from "../../core/game/SignalBus";
import type { ParticlePool } from "../../pools/ParticlePool";

interface EnemyDiedDetail {
    x: number;
    y: number;
    defeated?: boolean;
    color?: number;
}

interface PlayerDiedDetail {
    x?: number;
    y?: number;
}

export class ParticleMediator implements IContextItem {
    private readonly pool: ParticlePool;
    private readonly signalBus: SignalBus;

    constructor(pool: ParticlePool, signalBus: SignalBus) {
        this.pool = pool;
        this.signalBus = signalBus;

        this.setupSignalListeners();
    }

    private setupSignalListeners(): void {
        this.signalBus.addEventListener(GameSignals.ENEMY_DIED, this.onEnemyDied);
        this.signalBus.addEventListener(GameSignals.PLAYER_DIED, this.onPlayerDied);
        this.signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
    }

    private onEnemyDied = (event: Event): void => {
        const data = (event as CustomEvent<EnemyDiedDetail>).detail;
        if (!data) return;

        const color = data.color ?? 0xffffff;

        if (data.defeated) {
            this.pool.spawnExplosion(data.x, data.y, color);
        } else {
            // Spawn a tiny hit flash (4 particles) on damage
            this.pool.spawnExplosion(data.x, data.y, color, 4);
        }
    };

    private onPlayerDied = (event: Event): void => {
        const data = (event as CustomEvent<PlayerDiedDetail>).detail;
        const x = data?.x ?? 225; // Default center X fallback
        const y = data?.y ?? 600; // Default center Y fallback

        this.pool.spawnExplosion(x, y, 0x00ffff);
    };

    private onRunRestarted = (): void => {
        this.pool.clear();
    };

    public update(delta: number): void {
        const particles = this.pool.activeParticles;

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            if (particle.update(delta)) {
                this.pool.recycle(particle, i);
            }
        }
    }

    public destroy(): void {
        this.signalBus.removeEventListener(GameSignals.ENEMY_DIED, this.onEnemyDied);
        this.signalBus.removeEventListener(GameSignals.PLAYER_DIED, this.onPlayerDied);
        this.signalBus.removeEventListener(GameSignals.RUN_RESTARTED, this.onRunRestarted);
    }
}
