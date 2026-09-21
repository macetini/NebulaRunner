import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';
import type { BuffPool } from '../pools/BuffPool';
import type { PlayerView } from '../views/PlayerView';
import { BuffType } from '../buffs/BuffType';

export class BuffMediator implements IContextItem {
    private readonly pool: BuffPool;
    private readonly config: GameConfig;
    private readonly screenHeight: number;
    private readonly player: PlayerView;

    constructor(pool: BuffPool, config: GameConfig, signalBus: SignalBus, screenHeight: number, player: PlayerView) {
        this.pool = pool;
        this.config = config;
        this.screenHeight = screenHeight;
        this.player = player;
        signalBus.addEventListener(GameSignals.ENEMY_DIED, this.handleEnemyDefeated);
        signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.handleRestart);
    }

    public update(delta: number): void {
        const buffs = this.pool.activeBuffs;
        const playerX = this.player.x;
        const playerY = this.player.y;

        for (let index = buffs.length - 1; index >= 0; index -= 1) {
            const buff = buffs[index];

            const dx = playerX - buff.x;
            const dy = playerY - buff.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0 && distance < this.config.buffMagnetRadius) {
                // Smoothly steer velocity towards player
                const targetVelX = (dx / distance) * this.config.buffMagnetSpeed;
                const targetVelY = (dy / distance) * this.config.buffMagnetSpeed;

                const lerpFactor = Math.min(1, 0.12 * delta);
                buff.velocityX += (targetVelX - buff.velocityX) * lerpFactor;
                buff.velocityY += (targetVelY - buff.velocityY) * lerpFactor;
            } else {
                // Smoothly return to standard vertical fall
                const targetVelX = 0;
                const targetVelY = this.config.buffFallSpeed;

                const lerpFactor = Math.min(1, 0.05 * delta);
                buff.velocityX += (targetVelX - buff.velocityX) * lerpFactor;
                buff.velocityY += (targetVelY - buff.velocityY) * lerpFactor;
            }

            buff.update(delta);

            if (buff.y > this.screenHeight + buff.height) {
                this.pool.recycle(buff, index);
            }
        }
    }

    private readonly handleEnemyDefeated = (event: Event): void => {
        const { x, y, defeated } = (event as CustomEvent<{
            x: number;
            y: number;
            defeated: boolean;
        }>).detail;
        if (defeated && Math.random() < this.config.buffDropChance) {
            const dropRoll = Math.random();
            const type = dropRoll < 0.34
                ? BuffType.RAPID_FIRE
                : dropRoll < 0.67 ? BuffType.SHIELD : BuffType.EXPLOSION;
            this.pool.spawn(x, y, this.config.buffFallSpeed, type);
        }
    };

    private readonly handleRestart = (): void => {
        this.pool.clear();
    };
}
