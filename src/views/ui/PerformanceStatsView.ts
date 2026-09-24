import * as PIXI from 'pixi.js';

type MemoryPerformance = Performance & {
    memory?: {
        usedJSHeapSize: number;
    };
};

export class PerformanceStatsView extends PIXI.Text {
    private readonly padding = 20;

    // FPS Statistics Tracking
    private minFps = Infinity;
    private maxFps = 0;
    private totalFpsSum = 0;
    private sampleCount = 0;

    constructor() {
        super({
            text: '',
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x55FFAA,
                fontWeight: 'bold',
                align: 'right',
                dropShadow: {
                    alpha: 0.5,
                    angle: 2,
                    blur: 2,
                    color: 0x000000,
                    distance: 2,
                },
            }),
        });

        this.anchor.set(1, 0);
    }

    public update(fps: number, delta: number, screenWidth: number): void {
        const roundedFps = Math.round(fps);

        // Filter out initial startup frame spikes (0 FPS)
        if (roundedFps > 0) {
            this.minFps = Math.min(this.minFps, roundedFps);
            this.maxFps = Math.max(this.maxFps, roundedFps);
            this.totalFpsSum += roundedFps;
            this.sampleCount++;
        }

        const avgFps = this.sampleCount > 0 ? Math.round(this.totalFpsSum / this.sampleCount) : roundedFps;
        const displayMin = this.minFps === Infinity ? 0 : this.minFps;

        const frameTime = delta * (1000 / 60);
        const usedHeap = (performance as MemoryPerformance).memory?.usedJSHeapSize;
        const memory = usedHeap === undefined ? 'N/A' : `${(usedHeap / (1024 * 1024)).toFixed(1)} MB`;

        this.text = [
            `FPS: ${roundedFps}\nMIN: ${displayMin} | MAX: ${this.maxFps} | AVG: ${avgFps}`,
            `FRAME: ${frameTime.toFixed(1)} ms`,
            `MEMORY: ${memory}`,
        ].join('\n');

        this.position.set(screenWidth - this.padding, this.padding);
    }

    /**
     * Resets FPS stats (call this when restarting a game run).
     */
    public resetStats(): void {
        this.minFps = Infinity;
        this.maxFps = 0;
        this.totalFpsSum = 0;
        this.sampleCount = 0;
    }
}
