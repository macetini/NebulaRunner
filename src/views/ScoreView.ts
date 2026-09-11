import * as PIXI from 'pixi.js';

export class ScoreView extends PIXI.Container {
    private readonly POSITION: number = 20;
    private readonly SCORE_TEXT_TEMPLATE: string = 'SCORE: $';
    private readonly BEST_TEXT_TEMPLATE: string = 'BEST: $';

    private readonly scoreLabel: PIXI.Text;
    private readonly bestLabel: PIXI.Text;

    constructor() {
        super();

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
            dropShadow: {
                alpha: 0.5,
                angle: 2,
                blur: 2,
                color: 0x000000,
                distance: 2
            }
        });

        const scoreText = this.SCORE_TEXT_TEMPLATE.replace('$', '0');
        this.scoreLabel = new PIXI.Text({ text: scoreText, style });
        this.bestLabel = new PIXI.Text({ text: this.BEST_TEXT_TEMPLATE.replace('$', '0'), style });
        this.bestLabel.y = 30;
        this.addChild(this.scoreLabel, this.bestLabel);

        // Position it slightly padded from the top-left
        this.x = this.y = this.POSITION;

        this.updateScore(0, 0);
    }

    public updateScore(value: number, bestScore: number): void {
        this.scoreLabel.text = this.SCORE_TEXT_TEMPLATE.replace('$', value.toString());
        this.bestLabel.text = this.BEST_TEXT_TEMPLATE.replace('$', bestScore.toString());
    }
}