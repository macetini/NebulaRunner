import * as PIXI from 'pixi.js';

import { EnemyFactory } from '../core/EnemyFactory';
import type { GameConfig } from '../core/GameConfig';
import { GameSignals } from '../core/GameSignals';
import type { IContextItem } from '../core/meta/IContextItem';
import type { SignalBus } from '../core/SignalBus';
import type { EnemyPool } from "../pools/EnemyPool";
import type { PlayerView } from '../views/PlayerView';
import type { EnemyProfile } from '../views/types/EnemyProfile';
import { EnemyType } from '../views/types/EnemyType';

interface QueuedEnemy {
    x: number;
    y: number;
    profile: EnemyProfile;
    delay: number;
}

export class EnemyMediator implements IContextItem {
    private readonly app: PIXI.Application;
    private readonly pool: EnemyPool;
    private readonly config: GameConfig;
    private readonly factory: EnemyFactory;
    private readonly player: PlayerView;

    private spawnTimer: number = 0;
    private elapsedTime: number = 0;
    private readonly spawnQueue: QueuedEnemy[] = [];

    constructor(app: PIXI.Application, pool: EnemyPool, config: GameConfig, player: PlayerView, signalBus: SignalBus) {
        this.app = app;
        this.pool = pool;
        this.config = config;
        this.factory = new EnemyFactory(config);
        this.player = player;
        signalBus.addEventListener(GameSignals.RUN_RESTARTED, () => {
            this.spawnTimer = 0;
            this.elapsedTime = 0;
            this.spawnQueue.length = 0;
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

            // Constrain spawn position so wide sine oscillations or loops don't clip off-screen
            let x = Math.random() * this.app.screen.width;
            if (profile.type === EnemyType.SINE_CHAIN) {
                const chainAmplitude = this.config.enemySineOscillationAmplitude * 4.5;
                const chainMargin = Math.min(chainAmplitude + 15, this.app.screen.width * 0.5);
                const usableWidth = Math.max(0, this.app.screen.width - chainMargin * 2);
                x = chainMargin + Math.random() * usableWidth;
            } else if (profile.type === EnemyType.SWARMER) {
                const swarmMargin = Math.min(50, this.app.screen.width * 0.5);
                const usableWidth = Math.max(0, this.app.screen.width - swarmMargin * 2);
                x = swarmMargin + Math.random() * usableWidth;
            }
            const y = -50;

            if (profile.type === EnemyType.SINE_CHAIN) {
                // Spawn the head immediately
                this.pool.spawn(x, y, profile);

                // Queue the remaining segments to follow behind sequentially
                const chainLength = 6;
                const segmentDelay = 12; // frames between segment spawns
                for (let i = 1; i < chainLength; i++) {
                    this.spawnQueue.push({
                        x,
                        y,
                        profile: { ...profile },
                        delay: i * segmentDelay,
                    });
                }
            } else if (profile.type === EnemyType.SWARMER) {
                // Spawn the head immediately
                this.pool.spawn(x, y, profile);

                // Queue up a dense swarm of 8 looping swarmers!
                const chainLength = 8;
                const segmentDelay = 10; // slightly denser delay to keep the swarm close-knit
                for (let i = 1; i < chainLength; i++) {
                    this.spawnQueue.push({
                        x,
                        y,
                        profile: { ...profile },
                        delay: i * segmentDelay,
                    });
                }
            } else {
                this.pool.spawn(x, y, profile);
            }

            this.spawnTimer = 0;
        }

        const enemies = this.pool.activeEnemies;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.y > this.app.screen.height + 50) {
                this.pool.recycle(enemy, i);
            } else {
                enemy.updateMovement(delta, this.player.x, this.getSpeedMultiplier());
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
