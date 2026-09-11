import { GameSignals } from "../core/GameSignals";
import type { IContextItem } from "../core/meta/IContextItem";
import { SignalBus } from "../core/SignalBus";
import type { ProjectilePool } from "../pools/ProjectilePool";

export class ProjectileMediator implements IContextItem {
    private readonly SPEED: number = 12;

    private readonly pool: ProjectilePool;
    private readonly signalBus: SignalBus;

    constructor(pool: ProjectilePool, signalBus: SignalBus) {
        this.pool = pool;
        this.signalBus = signalBus;


        this.signalBus.addEventListener(GameSignals.PLAYER_FIRED, (e: Event) => {
            const customEvent = e as CustomEvent;
            const { x, y } = customEvent.detail;
            this.pool.spawn(x, y - 25);
        });
    }

    public update(delta: number): void {
        const bullets = this.pool.activeBullets;
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.y -= this.SPEED * delta;
            if (bullet.y < -bullet.height) {
                this.pool.recycle(bullet, i);
            }
        }
    }
}