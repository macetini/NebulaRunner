import * as PIXI from 'pixi.js';

type MemoryPerformance = Performance & {
    memory?: {
        usedJSHeapSize: number;
    };
};

export class PerformanceStatsView extends PIXI.Text {
    private readonly padding = 20;

    constructor() {
        super({
            text: '',
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x55FFAA,
                fontWeight: 'bold',
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
        const frameTime = delta * (1000 / 60);
        const usedHeap = (performance as MemoryPerformance).memory?.usedJSHeapSize;
        const memory = usedHeap === undefined ? 'N/A' : `${(usedHeap / (1024 * 1024)).toFixed(1)} MB`;
        this.text = `FPS: ${Math.round(fps)}\nFRAME: ${frameTime.toFixed(1)} ms\nMEMORY: ${memory}`;
        this.position.set(screenWidth - this.padding, this.padding);
    }
}
