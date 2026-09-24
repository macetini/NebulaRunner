/**
 * A simple event bus for dispatching and listening to custom events within the game.
 */
export class SignalBus extends EventTarget {
    public dispatch(type: string, detail?: any): void {
        this.dispatchEvent(new CustomEvent(type, { detail }));
    }
}
