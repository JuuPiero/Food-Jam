import { GoodsState } from './GoodsState';

export class GoodsInteractiveState extends GoodsState {
    
    public enterState(): void {
        this._goods.node.active = false;
    }

    public exitState(): void {
        this._goods.node.active = true;
    }
}


