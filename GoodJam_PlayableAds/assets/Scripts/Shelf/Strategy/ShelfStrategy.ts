import { Shelf } from "../Shelf";

export abstract class ShelfStrategy {

    protected _shelf: Shelf = null;

    public constructor(shelf: Shelf) {
        this._shelf = shelf;
    }

    public abstract move(dt: number): void;
    public abstract complete(): Promise<void>;
}


