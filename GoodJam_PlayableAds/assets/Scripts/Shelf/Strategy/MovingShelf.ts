import { ShelfStrategy } from "./ShelfStrategy";


export abstract class MovingShelf extends ShelfStrategy {

    public abstract move(dt: number): void;

    public complete(): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }
}