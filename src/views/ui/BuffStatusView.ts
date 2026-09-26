import * as PIXI from 'pixi.js';

export class BuffStatusView extends PIXI.Container {
    private readonly panel: PIXI.Graphics;
    private readonly progress: PIXI.Graphics;
    private readonly titleLabel: PIXI.Text;
    private readonly timeLabel: PIXI.Text;
    private readonly accentColor: number;
    private readonly panelWidth = 158;
    private readonly panelHeight = 42;

    constructor(title: string, accentColor: number, y: number) {
        super();
        this.accentColor = accentColor;

        this.panel = new PIXI.Graphics();
        this.progress = new PIXI.Graphics();
        this.titleLabel = new PIXI.Text({
            text: title,
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: accentColor,
                fontWeight: 'bold',
            }),
        });
        this.timeLabel = new PIXI.Text({
            text: '0.0',
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0xFFFFFF,
                fontWeight: 'bold',
                align: 'right',
            }),
        });

        this.panel.roundRect(0, 0, this.panelWidth, this.panelHeight, 8).fill({
            color: 0x10182C,
            alpha: 0.88,
        });
        this.panel.roundRect(1, 1, this.panelWidth - 2, this.panelHeight - 2, 7).stroke({
            color: accentColor,
            alpha: 0.7,
            width: 1,
        });
        this.titleLabel.x = 10;
        this.titleLabel.y = 6;
        this.timeLabel.anchor.set(1, 0);
        this.timeLabel.x = this.panelWidth - 10;
        this.timeLabel.y = 6;

        this.addChild(this.panel, this.progress, this.titleLabel, this.timeLabel);
        this.x = 20;
        this.y = y;
        this.visible = false;
    }

    public update(remaining: number, duration: number): void {
        const progress = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;
        this.visible = progress > 0;
        if (!this.visible) {
            return;
        }

        this.timeLabel.text = `${(remaining).toFixed(1)}s`;
        this.progress.clear();
        this.progress.roundRect(10, 29, (this.panelWidth - 20) * progress, 5, 2).fill(this.accentColor);
    }
}
