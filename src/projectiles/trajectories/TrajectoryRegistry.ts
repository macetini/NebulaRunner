// src/projectiles/trajectories/TrajectoryRegistry.ts

import type { ITrajectoryStrategy } from "./meta/ITrajectoryStrategy";
import { StraightTrajectoryStrategy } from "./StraightTrajectoryStrategy";
import { WaveTrajectoryStrategy } from "./WaveTrajectoryStrategy";

export class TrajectoryRegistry {
    private static readonly strategies: Map<string, ITrajectoryStrategy> = new Map();
    private static readonly fallbackStrategy: ITrajectoryStrategy = new StraightTrajectoryStrategy();

    static {
        const straight = new StraightTrajectoryStrategy();

        this.strategies.set('straight', straight);
        this.strategies.set('spread', straight);
        this.strategies.set('directional', straight);

        this.strategies.set('wave', new WaveTrajectoryStrategy());
    }

    public static getStrategy(behavior?: string): ITrajectoryStrategy {
        if (!behavior) {
            return this.fallbackStrategy;
        }

        return this.strategies.get(behavior) ?? this.fallbackStrategy;
    }
}
