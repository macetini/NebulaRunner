import type { GameConfig } from "../../core/GameConfig";
import { GameSignals } from "../../core/GameSignals";
import type { IContextItem } from "../../core/meta/IContextItem";
import type { SignalBus } from "../../core/SignalBus";
import type { WeaponPickupPool } from "../../pools/WeaponPickupPool";
import type { PlayerView } from "../../views/gameplay/PlayerView";


export class WeaponDropMediator implements IContextItem {
    private readonly pool: WeaponPickupPool;
    private readonly config: GameConfig;
    private readonly screenHeight: number;
    private readonly player: PlayerView;

    constructor(pool: WeaponPickupPool, config: GameConfig, signalBus: SignalBus, screenHeight: number, player: PlayerView) {
        this.pool = pool;
        this.config = config;
        this.screenHeight = screenHeight;
        this.player = player;

        signalBus.addEventListener(GameSignals.ENEMY_DIED, this.handleEnemyDefeated);
        signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.handleRestart);
    }

    public update(delta: number): void {
        const pickups = this.pool.activeWeaponPickups;
        const playerX = this.player.x;
        const playerY = this.player.y;

        for (let index = pickups.length - 1; index >= 0; index -= 1) {
            const pickup = pickups[index];

            const dx = playerX - pickup.x;
            const dy = playerY - pickup.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0 && distance < this.config.buffMagnetRadius) {
                const targetVelX = (dx / distance) * this.config.buffMagnetSpeed;
                const targetVelY = (dy / distance) * this.config.buffMagnetSpeed;
                const lerpFactor = Math.min(1, 0.12 * delta);
                pickup.velocityX += (targetVelX - pickup.velocityX) * lerpFactor;
                pickup.velocityY += (targetVelY - pickup.velocityY) * lerpFactor;
            } else {
                const targetVelX = 0;
                const targetVelY = this.config.buffFallSpeed;
                const lerpFactor = Math.min(1, 0.05 * delta);
                pickup.velocityX += (targetVelX - pickup.velocityX) * lerpFactor;
                pickup.velocityY += (targetVelY - pickup.velocityY) * lerpFactor;
            }

            pickup.update(delta);

            if (pickup.y > this.screenHeight + 24) {
                this.pool.recycle(pickup, index);
            }
        }
    }

    private readonly handleEnemyDefeated = (event: Event): void => {
        const { x, y, defeated } = (event as CustomEvent<{ x: number; y: number; defeated: boolean }>).detail;

        if (defeated && Math.random() < 0.08) {
            const weaponIds = ['blaster', 'plasmaCannon', 'spreadShot', 'pulseLaser', 'rearVulcan', 'sonicBlade', 'homingSeeker', 'clusterBomb'];
            const weaponId = weaponIds[Math.floor(Math.random() * weaponIds.length)];
            this.pool.spawn(x, y, this.config.buffFallSpeed, weaponId);
        }
    };

    private readonly handleRestart = (): void => {
        this.pool.clear();
    };
}
