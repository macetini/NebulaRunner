import * as PIXI from 'pixi.js';

export class PlayerShieldView extends PIXI.Container {
    private readonly outerWave: PIXI.Graphics;
    private readonly hexagonField: PIXI.Graphics;
    private readonly coreBarrier: PIXI.Graphics;

    private animationTime = 0;
    private transition = 0;
    private transitionDirection: 1 | -1 = 1;
    private hitTimer = 0;
    private durationRemaining = 0;
    private active = false;

    public constructor() {
        super();

        this.coreBarrier = new PIXI.Graphics()
            .circle(0, 0, 30)
            .fill({ color: 0x00B0FF, alpha: 0.15 });

        let radius = 36;

        this.outerWave = new PIXI.Graphics()
            .circle(0, 0, radius + 4)
            .stroke({ width: 1, color: 0x00E5FF, alpha: 0.4 });

        // Apply a lightweight GPU blur to smooth out the stroke edges
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.strength = 4;
        blurFilter.quality = 3;

        this.outerWave.filters = [blurFilter];

        this.hexagonField = new PIXI.Graphics()
            .regularPoly(0, 0, radius, 6)
            .stroke({ width: 1, color: 0x7AEEFF, alpha: 0.35 });

        this.coreBarrier.blendMode = 'add';
        this.outerWave.blendMode = 'add';
        this.hexagonField.blendMode = 'add';

        this.addChild(this.coreBarrier, this.outerWave, this.hexagonField);

        this.visible = false;
        this.alpha = 0;
        this.scale.set(0);
    }

    public activate(durationSeconds?: number): void {
        this.active = true;
        this.visible = true;
        this.animationTime = 0;
        this.durationRemaining = durationSeconds === undefined ? 0 : durationSeconds * 60;
        this.transition = 0.2;
        this.transitionDirection = 1;
        this.hitTimer = 0;
        this.alpha = 1;
        this.scale.set(this.transition);
        this.setEnergyColor(false);
    }

    public triggerHitResponse(): void {
        if (!this.visible) return;

        this.hitTimer = 9;
        this.setEnergyColor(true);
    }

    public deactivate(): void {
        this.active = false;
        if (!this.visible) return;

        this.transitionDirection = -1;
        this.transition = Math.min(this.transition, 1);
    }

    public setActive(active: boolean): void {
        if (active) {
            if (!this.active || this.transitionDirection === -1) {
                this.activate();
            }
            return;
        }

        if (this.active || this.visible) {
            this.deactivate();
        }
    }

    public reset(): void {
        this.active = false;
        this.visible = false;
        this.alpha = 0;
        this.scale.set(0);
        this.transition = 0;
        this.transitionDirection = 1;
        this.durationRemaining = 0;
        this.hitTimer = 0;
        this.setEnergyColor(false);
    }

    public update(delta: number): void {
        if (!this.visible) return;

        this.animationTime += delta;

        if (this.durationRemaining > 0) {
            this.durationRemaining = Math.max(0, this.durationRemaining - delta);
            if (this.durationRemaining === 0) {
                this.deactivate();
            }
        }

        if (this.transitionDirection === 1) {
            this.transition = Math.min(1, this.transition + delta * 0.12);
        } else {
            this.transition = Math.max(0, this.transition - delta * 0.12);
            if (this.transition === 0) {
                this.visible = false;
                this.alpha = 0;
                this.transitionDirection = 1;
                return;
            }
        }

        const easedScale = this.easeOutBack(this.transition);
        this.scale.set(easedScale);

        this.hexagonField.rotation += delta * 0.02;

        const wavePulse = 1 + (Math.sin(this.animationTime * 0.08) + 1) * 0.04;
        this.outerWave.scale.set(wavePulse);

        const flicker = 0.94 + Math.random() * 0.06;
        this.alpha = flicker * this.transition;

        if (this.hitTimer > 0) {
            this.hitTimer = Math.max(0, this.hitTimer - delta);
            if (this.hitTimer === 0) {
                this.setEnergyColor(false);
            }
        }
    }

    private setEnergyColor(hit: boolean): void {
        const color = hit ? 0xFFFFFF : 0x00E5FF;
        this.outerWave.tint = color;
        this.coreBarrier.tint = hit ? 0xFF6677 : 0x00B0FF;
        this.hexagonField.tint = color;
    }

    private easeOutBack(x: number): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }
}
