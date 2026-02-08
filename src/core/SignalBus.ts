/**
 * Event bus
 */
export class SignalBus extends EventTarget {
    public dispatch(type: string, detail?: any): void {
        this.dispatchEvent(new CustomEvent(type, { detail }));
    }
}