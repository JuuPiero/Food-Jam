import { Color } from 'cc';
import { GoodsState } from './GoodsState';

export class GoodsInteractiveState extends GoodsState {
    
    public enterState(): void {
        this._goods.node.active = false;
        // this._goods.sptGoods.color = new Color(50, 50, 50, 255);
    }

    public exitState(): void {
        this._goods.node.active = true;
    }
}


