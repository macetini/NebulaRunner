import * as PIXI from 'pixi.js';

import { EnemyAttackFactory } from '../combat/EnemyAttackFactory';
import type { EnemyAttackStrategy } from '../combat/EnemyAttackStrategy';
import { EnemyFactory } from '../core/EnemyFactory';
import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';
import type { EnemyPool } from "../pools/EnemyPool";
import type { QueuedEnemy } from '../spawning/SpawnPattern';
import { SpawnPatternFactory } from '../spawning/SpawnPatternFactory';
import type { EnemyView } from '../views/EnemyView';
import type { PlayerView } from '../views/PlayerView';

type EnemyAttackBinding = {
    type: EnemyView['type'];
    strategy: EnemyAttackStrategy;
};

export class EnemyMediator implements IContextItem {
    private readonly app: PIXI.Application;
    private readonly pool: EnemyPool;
    private readonly config: GameConfig;
    private readonly factory: EnemyFactory;
    private readonly player: PlayerView;
    private readonly spawnPatternFactory: SpawnPatternFactory;
    private readonly signalBus: SignalBus;
    private readonly attackFactory: EnemyAttackFactory;
    private readonly attacks = new Map<EnemyView, EnemyAttackBinding>();

    private spawnTimer: number = 0;
    private elapsedTime: number = 0;
    private readonly spawnQueue: QueuedEnemy[] = [];

    constructor(app: PIXI.Application, pool: EnemyPool, config: GameConfig, player: PlayerView, signalBus: SignalBus) {
        this.app = app;
        this.pool = pool;
        this.config = config;
        this.factory = new EnemyFactory(config);
        this.player = player;
        this.spawnPatternFactory = new SpawnPatternFactory();
        this.signalBus = signalBus;
        this.attackFactory = new EnemyAttackFactory();
        signalBus.addEventListener(GameSignals.RUN_RESTARTED, () => {
            this.spawnTimer = 0;
            this.elapsedTime = 0;
            this.spawnQueue.length = 0;
            this.attacks.clear();
        });
    }

    public update(delta: number): void {
        this.elapsedTime += delta / 60;

        // Process any queued chain segment spawns
        for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
            const queued = this.spawnQueue[i];
            queued.delay -= delta;
            if (queued.delay <= 0) {
                this.pool.spawn(queued.x, queued.y, queued.profile);
                this.spawnQueue.splice(i, 1);
            }
        }

        this.spawnTimer += delta;
        if (this.spawnTimer > this.getSpawnInterval()) {
            const profile = this.factory.createRandom(this.elapsedTime);

            const pattern = this.spawnPatternFactory.getPattern(profile.type);
            const x = pattern.calculateSpawnX(this.app.screen.width, this.config);
            const y = -50;

            pattern.spawn(x, y, profile, this.pool, this.spawnQueue);

            this.spawnTimer = 0;
        }

        const enemies = this.pool.activeEnemies;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.y > this.app.screen.height + 50) {
                this.attacks.delete(enemy);
                this.pool.recycle(enemy, i);
            } else {
                enemy.updateMovement(delta, this.player.x, this.getSpeedMultiplier());
                let binding = this.attacks.get(enemy);
                if (!binding || binding.type !== enemy.type) {
                    binding = {
                        type: enemy.type,
                        strategy: this.attackFactory.create(enemy.type),
                    };
                    this.attacks.set(enemy, binding);
                }
                binding.strategy.update({
                    delta,
                    enemyX: enemy.x,
                    enemyY: enemy.y,
                    playerX: this.player.x,
                    playerY: this.player.y,
                    signalBus: this.signalBus,
                    config: this.config,
                });
            }
        }
    }

    private getSpawnInterval(): number {
        return Math.max(
            this.config.enemyMinimumSpawnInterval,
            this.config.enemySpawnInterval - this.elapsedTime * this.config.enemySpawnIntervalDecreasePerSecond,
        );
    }

    private getSpeedMultiplier(): number {
        return 1 + Math.min(
            this.config.enemyMaximumSpeedIncrease,
            this.elapsedTime * this.config.enemySpeedIncreasePerSecond,
        );
    }
}
