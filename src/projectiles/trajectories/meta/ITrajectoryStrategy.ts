// src/projectiles/trajectories/meta/ITrajectoryStrategy.ts
import type { ITrajectoryContext } from "./ITrajectoryContext";

export interface ITrajectoryStrategy {
    calculateNextPosition(context: ITrajectoryContext, delta: number): { x: number; y: number };
}
