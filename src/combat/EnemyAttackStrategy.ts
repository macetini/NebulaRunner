import type { GameConfig } from '../core/game/GameConfig';
import { GameSignals } from '../core/game/GameSignals';
import type { SignalBus } from '../core/game/SignalBus';

export type EnemyAttackContext = {
    delta: number;
    enemyX: number;
    enemyY: number;
    playerX: number;
    playerY: number;
    signalBus: SignalBus;
    config: GameConfig;
};

export interface EnemyAttackStrategy {
    update(context: EnemyAttackContext): void;
}

export class NoAttackStrategy implements EnemyAttackStrategy {
    public update(_context: EnemyAttackContext): void {
        // Intentionally empty: most enemies do not attack at range.
    }
}

export class RangedAttackStrategy implements EnemyAttackStrategy {
    private shootTimer = 0;

    public update(context: EnemyAttackContext): void {
        this.shootTimer += context.delta;

        const dx = context.playerX - context.enemyX;
        const dy = context.playerY - context.enemyY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= context.config.enemyShootingRange) {
            return;
        }

        if (this.shootTimer < context.config.enemyFireCooldown) {
            return;
        }

        context.signalBus.dispatch(GameSignals.ENEMY_FIRED, {
            x: context.enemyX,
            y: context.enemyY,
        });
        this.shootTimer = 0;
    }
}
