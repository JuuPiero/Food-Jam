import { ShelfStrategy } from "./Strategy/ShelfStrategy";


export class FallingShelf extends ShelfStrategy {

    public move(dt: number): void {
        
    }

    public complete(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            resolve();
        });
    }
}