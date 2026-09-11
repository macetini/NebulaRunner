import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';
import type { BuffPool } from '../pools/BuffPool';

export class BuffMediator implements IContextItem {
    private readonly pool: BuffPool;
    private readonly config: GameConfig;
    private readonly screenHeight: number;

    constructor(pool: BuffPool, config: GameConfig, signalBus: SignalBus, screenHeight: number) {
        this.pool = pool;
        this.config = config;
        this.screenHeight = screenHeight;
        signalBus.addEventListener(GameSignals.ENEMY_DIED, this.handleEnemyDefeated);
        signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.handleRestart);
    }

    public update(delta: number): void {
        const buffs = this.pool.activeBuffs;
        for (let index = buffs.length - 1; index >= 0; index -= 1) {
            const buff = buffs[index];
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
            this.pool.spawn(x, y, this.config.buffFallSpeed);
        }
    };

    private readonly handleRestart = (): void => {
        this.pool.clear();
    };
}
