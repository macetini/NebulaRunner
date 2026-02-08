import type { IContextItem } from "../core/meta/IContextItem";
import type { BackgroundView } from "../views/BackgroundView";

export class BackgroundMediator implements IContextItem {
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
