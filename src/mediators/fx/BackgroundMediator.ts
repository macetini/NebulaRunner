import type { IContextItem } from "../../core/context/meta/IContextItem";
import type { BackgroundView } from "../../views/fx/BackgroundView";


export class BackgroundMediator implements IContextItem {
    private readonly view: BackgroundView;
    private readonly movementSpeed: () => number;
    constructor(
        view: BackgroundView,
        movementSpeed: () => number,
    ) {
        this.view = view;
        this.movementSpeed = movementSpeed;
    }

    public update(delta: number): void {
        this.view.setMovementSpeed(this.movementSpeed());
        this.view.moveDown(delta);
    }
}
