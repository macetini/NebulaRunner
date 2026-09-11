import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';
import { BuffType } from './BuffType';

export class BuffManager implements IContextItem {
    private readonly config: GameConfig;
    private rapidFireRemaining = 0;

    constructor(config: GameConfig, signalBus: SignalBus) {
        this.config = config;
        signalBus.addEventListener(GameSignals.BUFF_COLLECTED, this.handleBuffCollected);
        signalBus.addEventListener(GameSignals.RUN_RESTARTED, this.reset);
    }

    public get fireCooldown(): number {
        return this.rapidFireRemaining > 0
            ? this.config.rapidFireCooldown
            : this.config.fireCooldown;
    }

    public update(delta: number): void {
        this.rapidFireRemaining = Math.max(0, this.rapidFireRemaining - delta);
    }

    private readonly handleBuffCollected = (event: Event): void => {
        const { type } = (event as CustomEvent<{ type: BuffType }>).detail;
        if (type === BuffType.RAPID_FIRE) {
            this.rapidFireRemaining = this.config.rapidFireDuration;
        }
    };

    private readonly reset = (): void => {
        this.rapidFireRemaining = 0;
    };
}
