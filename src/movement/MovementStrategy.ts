export type MovementPosition = {
    x: number;
    y: number;
};

export interface MovementStrategy {
    reset(position: MovementPosition): void;
    update(position: MovementPosition, delta: number, targetX: number, speedMultiplier: number): void;
}
