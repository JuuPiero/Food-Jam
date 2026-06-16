import { IEnterState, IExitState } from "../Base/State/IState";
import { Box } from "./Box";

export class BoxState implements IEnterState, IExitState {

    public constructor(box: Box) {
        this._box = box;
    }

    protected _box: Box = null;

    public enterState(): void {
        // console.log("BoxState enterState");
    }

    public exitState(): void {
        // console.log("BoxState exitState");
    }
}