import { GameSignals } from "../core/GameSignals";
import { SignalBus } from "../core/SignalBus";
import type { ProjectilePool } from "../pools/ProjectilePool";

export class ProjectileMediator {
    private readonly SPEED: number = 12;
    private readonly pool: ProjectilePool;
    private readonly signalBus: SignalBus;
    private readonly screenWidth: number;

    constructor(pool: ProjectilePool, signalBus: SignalBus, screenWidth: number) {
        this.pool = pool;
        this.signalBus = signalBus;
        this.screenWidth = screenWidth;


        this.signalBus.addEventListener(GameSignals.PLAYER_FIRED, (e: Event) => {
            const customEvent = e as CustomEvent;
            const { x, y } = customEvent.detail;
            this.pool.spawn(x + 25, y);
        });
    }

    public update(delta: number): void {
        const bullets = this.pool.activeBullets;
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.x += this.SPEED * delta;
            if (bullet.x > this.screenWidth + 50) {
                this.pool.recycle(bullet, i);
            }
        }
    }
}