import type { BackgroundView } from "../views/BackgroundView";
import type { PlayerView } from "../views/PlayerView";

export class BackgroundMediator {
    private readonly view: BackgroundView;
    constructor(
        view: BackgroundView,
    ) {
        this.view = view;
    }

    public update(delta: number): void {
        this.view.moveLeft(delta);
    }
}
