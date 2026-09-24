import * as PIXI from 'pixi.js';

export class BoostStatusView extends PIXI.Container {
    private readonly progress = new PIXI.Graphics();
    private readonly chargeLabel: PIXI.Text;
    private readonly panelWidth = 158;

    constructor() {
        super();

        const panel = new PIXI.Graphics()
            .roundRect(0, 0, this.panelWidth, 42, 8)
            .fill({ color: 0x10182C, alpha: 0.88 })
            .roundRect(1, 1, this.panelWidth - 2, 40, 7)
            .stroke({ color: 0xFF8844, alpha: 0.7, width: 1 });
        const titleLabel = new PIXI.Text({
            text: 'BOOST',
            style: new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 14, fill: 0xFF8844, fontWeight: 'bold' }),
        });
        this.chargeLabel = new PIXI.Text({
            text: '0%',
            style: new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 14, fill: 0xFFFFFF, fontWeight: 'bold' }),
        });

        titleLabel.position.set(10, 6);
        this.chargeLabel.anchor.set(1, 0);
        this.chargeLabel.position.set(this.panelWidth - 10, 6);
        this.addChild(panel, this.progress, titleLabel, this.chargeLabel);
        this.position.set(20, 188);
    }

    public update(charge: number, maximumCharge: number): void {
        const progress = maximumCharge > 0 ? Math.max(0, Math.min(1, charge / maximumCharge)) : 0;
        this.chargeLabel.text = `${Math.round(progress * 100)}%`;
        this.progress.clear();
        this.progress.roundRect(10, 29, (this.panelWidth - 20) * progress, 5, 2).fill(0xFF8844);
    }
}
