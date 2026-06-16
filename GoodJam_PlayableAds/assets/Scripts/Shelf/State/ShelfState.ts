import { IEnterState, IExitState, IUpdateState } from "../../Base/State/IState";
import { Shelf } from "../Shelf";

export abstract class ShelfState implements IEnterState, IExitState, IUpdateState {

    protected _shelf: Shelf = null;

    public constructor(shelf: Shelf) {
        this._shelf = shelf;
    }
    updateState(dt: number): void {
        // throw new Error("Method not implemented.");
    }

    public abstract enterState(): void;
    public abstract exitState(): void;

}