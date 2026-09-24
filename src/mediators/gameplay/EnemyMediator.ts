import * as PIXI from 'pixi.js';
import { EnemyAttackFactory } from '../../combat/EnemyAttackFactory';
import type { EnemyAttackStrategy } from '../../combat/EnemyAttackStrategy';
import type { IContextItem } from '../../core/context/meta/IContextItem';
import type { GameConfig } from '../../core/game/GameConfig';
import { GameSignals } from '../../core/game/GameSignals';
import type { SignalBus } from '../../core/game/SignalBus';
import { EnemyFactory } from '../../factories/EnemyFactory';
import type { EnemyPool } from '../../pools/EnemyPool';
import type { QueuedEnemy } from '../../spawning/SpawnPattern';
import { SpawnPatternFactory } from '../../spawning/SpawnPatternFactory';
import type { EnemyView } from '../../views/gameplay/EnemyView';
import type { PlayerView } from '../../views/gameplay/PlayerView';

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
    private staticBoxSpawnTimer: number = 0;
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
            this.staticBoxSpawnTimer = 0;
            this.elapsedTime = 0;
            this.spawnQueue.length = 0;
            this.attacks.clear();
        });
    }

    public update(delta: number): void {
        this.elapsedTime += delta / 60;

        this.processSpawnQueue(delta);
        this.checkAndSpawnEnemy(delta);
        this.checkAndSpawnStaticBox(delta);
        this.updateEnemies(delta);
    }

    private processSpawnQueue(delta: number): void {
        for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
            const queued = this.spawnQueue[i];
            queued.delay -= delta;
            if (queued.delay <= 0) {
                this.pool.spawn(queued.x, queued.y, queued.profile);
                this.spawnQueue.splice(i, 1);
            }
        }
    }

    private checkAndSpawnEnemy(delta: number): void {
        this.spawnTimer += delta;
        if (this.spawnTimer <= this.getSpawnInterval()) {
            return;
        }

        const profile = this.factory.createRandom(this.elapsedTime);
        const pattern = this.spawnPatternFactory.getPattern(profile.type);
        const x = pattern.calculateSpawnX(this.app.screen.width, this.config);
        const y = -50;

        pattern.spawn(x, y, profile, this.pool, this.spawnQueue);

        this.spawnTimer = 0;
    }

    private checkAndSpawnStaticBox(delta: number): void {
        this.staticBoxSpawnTimer += delta;
        if (this.staticBoxSpawnTimer < this.config.staticBoxSpawnInterval
            || this.pool.activeEnemies.filter((enemy) => enemy.type === 'staticBox').length
            >= this.config.staticBoxMaximumOnScreen) {
            return;
        }

        const padding = 50;
        const x = padding + Math.random() * (this.app.screen.width - padding * 2);
        const y = -50;
        this.pool.spawn(x, y, this.factory.createStaticBox());
        this.staticBoxSpawnTimer = 0;
    }

    private updateEnemies(delta: number): void {
        const enemies = this.pool.activeEnemies;
        for (let i = enemies.length - 1; i >= 0; i--) {
            this.processEnemyLifecycle(enemies[i], i, delta);
        }
    }

    private processEnemyLifecycle(enemy: EnemyView, index: number, delta: number): void {
        if (enemy.y > this.app.screen.height + 50) {
            this.attacks.delete(enemy);
            this.pool.recycle(enemy, index);
            return;
        }

        enemy.updateMovement(delta, this.player.x, this.getSpeedMultiplier());
        this.updateEnemyAttack(enemy, delta);
    }

    private updateEnemyAttack(enemy: EnemyView, delta: number): void {
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
