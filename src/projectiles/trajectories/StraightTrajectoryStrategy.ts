// src/projectiles/trajectories/StraightTrajectoryStrategy.ts

import type { ITrajectoryContext } from "./meta/ITrajectoryContext";
import type { ITrajectoryStrategy } from "./meta/ITrajectoryStrategy";

export class StraightTrajectoryStrategy implements ITrajectoryStrategy {
    public calculateNextPosition(context: ITrajectoryContext, delta: number): { x: number; y: number } {
        const dt = delta;
        return {
            x: context.x + context.vx * dt,
            y: context.y + context.vy * dt,
        };
    }
}
