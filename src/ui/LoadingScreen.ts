export class LoadingScreen {
    private readonly element: HTMLDivElement;
    private readonly message: HTMLParagraphElement;
    private readonly progress: HTMLDivElement;

    constructor() {
        this.element = document.createElement("div");
        this.element.className = "loading-screen";
        this.element.setAttribute("role", "status");
        this.element.setAttribute("aria-live", "polite");

        const content = document.createElement("div");
        content.className = "loading-screen__content";

        const title = document.createElement("h1");
        title.textContent = "Nebula Runner";

        this.message = document.createElement("p");
        this.message.textContent = "Preparing game";

        const track = document.createElement("div");
        track.className = "loading-screen__track";
        track.setAttribute("aria-hidden", "true");

        this.progress = document.createElement("div");
        this.progress.className = "loading-screen__progress";
        track.appendChild(this.progress);

        content.append(title, this.message, track);
        this.element.appendChild(content);
        document.body.appendChild(this.element);
    }

    public setProgress(value: number): void {
        const progress = Math.max(0, Math.min(100, value));
        this.progress.style.width = `${progress}%`;
    }

    public setMessage(message: string): void {
        this.message.textContent = message;
    }

    public show(): void {
        this.element.classList.remove("loading-screen--hidden");
    }

    public hide(): void {
        this.element.classList.add("loading-screen--hidden");
    }

    public showError(): void {
        this.setMessage("Unable to start game. Please refresh.");
        this.progress.classList.add("loading-screen__progress--error");
    }
}
