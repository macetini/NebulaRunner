import * as PIXI from 'pixi.js';

export class GameStateView extends PIXI.Container {
    private readonly titleLabel: PIXI.Text;
    private readonly promptLabel: PIXI.Text;

    constructor() {
        super();

        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 38,
            fill: 0x00FFFF,
            fontWeight: 'bold',
            align: 'center',
        });
        const promptStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xFFFFFF,
            align: 'center',
        });

        this.titleLabel = new PIXI.Text({ text: '', style: titleStyle });
        this.promptLabel = new PIXI.Text({ text: '', style: promptStyle });
        this.addChild(this.titleLabel, this.promptLabel);
    }

    public showReady(width: number, height: number): void {
        this.titleLabel.text = 'NEBULA RUNNER';
        this.promptLabel.text = 'TAP OR PRESS SPACE TO START';
        this.positionLabels(width, height);
        this.visible = true;
    }

    public showGameOver(width: number, height: number): void {
        this.titleLabel.text = 'GAME OVER';
        this.promptLabel.text = 'TAP OR PRESS SPACE TO RESTART';
        this.positionLabels(width, height);
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }

    private positionLabels(width: number, height: number): void {
        this.titleLabel.x = (width - this.titleLabel.width) * 0.5;
        this.titleLabel.y = height * 0.4;
        this.promptLabel.x = (width - this.promptLabel.width) * 0.5;
        this.promptLabel.y = this.titleLabel.y + this.titleLabel.height + 16;
    }
}
