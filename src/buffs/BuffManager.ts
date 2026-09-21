import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';
import { BuffType } from './BuffType';

export class BuffManager implements IContextItem {
    private readonly config: GameConfig;
    private rapidFireRemaining = 0;
    private shieldRemaining = 0;

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

    public get rapidFireActive(): boolean {
        return this.rapidFireRemaining > 0;
    }

    public get rapidFireTimeRemaining(): number {
        return this.rapidFireRemaining;
    }

    public get rapidFireDuration(): number {
        return this.config.rapidFireDuration;
    }

    public get shieldActive(): boolean {
        return this.shieldRemaining > 0;
    }

    public get shieldTimeRemaining(): number {
        return this.shieldRemaining;
    }

    public get shieldDuration(): number {
        return this.config.shieldDuration;
    }

    public update(delta: number): void {
        this.rapidFireRemaining = Math.max(0, this.rapidFireRemaining - delta);
        this.shieldRemaining = Math.max(0, this.shieldRemaining - delta);
    }

    public consumeShield(): boolean {
        if (!this.shieldActive) {
            return false;
        }

        this.shieldRemaining = 0;
        return true;
    }

    private readonly handleBuffCollected = (event: Event): void => {
        const { type } = (event as CustomEvent<{ type: BuffType }>).detail;
        if (type === BuffType.RAPID_FIRE) {
            this.rapidFireRemaining = this.config.rapidFireDuration;
        }
        if (type === BuffType.SHIELD) {
            this.shieldRemaining = this.config.shieldDuration;
        }
    };

    private readonly reset = (): void => {
        this.rapidFireRemaining = 0;
        this.shieldRemaining = 0;
    };
}
