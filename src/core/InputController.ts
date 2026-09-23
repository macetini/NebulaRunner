type InputState = {
    left: boolean;
    right: boolean;
    fire: boolean;
    touchActive: boolean;
    touchX: number;
};

export class InputController {
    private readonly canvas: HTMLCanvasElement;
    private readonly state: InputState = {
        left: false,
        right: false,
        fire: false,
        touchActive: false,
        touchX: 0,
    };
    private activePointerId: number | null = null;
    private pointerStartY = 0;
    private startRequested = false;
    private boostRequested = false;

    constructor(canvas: HTMLCanvasElement, screenWidth: number) {
        this.canvas = canvas;
        this.state.touchX = screenWidth * 0.5;

        globalThis.addEventListener('keydown', this.handleKeyDown);
        globalThis.addEventListener('keyup', this.handleKeyUp);

        canvas.addEventListener('pointerdown', this.handlePointerDown);
        canvas.addEventListener('pointermove', this.handlePointerMove);

        globalThis.addEventListener('pointerup', this.handlePointerEnd);
        globalThis.addEventListener('pointercancel', this.handlePointerEnd);
    }

    public get current(): InputState {
        return this.state;
    }

    public consumeStartRequest(): boolean {
        const requested = this.startRequested;
        this.startRequested = false;

        return requested;
    }

    public consumeBoostRequest(): boolean {
        const requested = this.boostRequested;
        this.boostRequested = false;
        return requested;
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (event.repeat) {
            return;
        }

        if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
            this.state.left = true;
        }
        if (event.code === 'ArrowRight' || event.code === 'KeyD') {
            this.state.right = true;
        }
        if (event.code === 'Space') {
            this.state.fire = true;
            this.startRequested = true;
        }
        if (event.code === 'ArrowUp' || event.code === 'KeyW') {
            this.boostRequested = true;
        }
    };

    private readonly handleKeyUp = (event: KeyboardEvent): void => {
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
            this.state.left = false;
        }

        if (event.code === 'ArrowRight' || event.code === 'KeyD') {
            this.state.right = false;
        }

        if (event.code === 'Space') {
            this.state.fire = false;
        }
    };

    private readonly handlePointerDown = (event: PointerEvent): void => {
        if (this.activePointerId !== null) {
            return;
        }

        this.activePointerId = event.pointerId;
        this.pointerStartY = event.clientY;
        this.startRequested = true;
        this.state.touchActive = true;
        this.state.fire = true;
        this.state.touchX = this.getCanvasX(event.clientX);
    };

    private readonly handlePointerMove = (event: PointerEvent): void => {
        if (this.activePointerId === event.pointerId) {
            this.state.touchX = this.getCanvasX(event.clientX);
            if (this.pointerStartY - event.clientY >= 48) {
                this.boostRequested = true;
                this.pointerStartY = event.clientY;
            }
        }
    };

    private readonly handlePointerEnd = (event: PointerEvent): void => {
        if (this.activePointerId !== event.pointerId) {
            return;
        }

        this.activePointerId = null;
        this.pointerStartY = 0;
        this.state.touchActive = false;
        this.state.fire = false;
    };

    private getCanvasX(clientX: number): number {
        const bounds = this.canvas.getBoundingClientRect();
        return ((clientX - bounds.left) / bounds.width) * this.canvas.width;
    }
}
