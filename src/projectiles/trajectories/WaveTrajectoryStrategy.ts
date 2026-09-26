// src/projectiles/trajectories/WaveTrajectoryStrategy.ts

import type { ITrajectoryContext } from "./meta/ITrajectoryContext";
import type { ITrajectoryStrategy } from "./meta/ITrajectoryStrategy";

export class WaveTrajectoryStrategy implements ITrajectoryStrategy {
    public calculateNextPosition(context: ITrajectoryContext, delta: number): { x: number; y: number } {
        const dt = delta / 60;
        const time = context.elapsedTime ?? 0;
        const waveX = Math.sin(time * 12) * 100;

        return {
            x: context.x + (context.vx + waveX) * dt,
            y: context.y + context.vy * dt,
        };
    }
}
