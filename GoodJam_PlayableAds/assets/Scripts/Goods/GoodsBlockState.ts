import { Color } from 'cc';
import { GoodsState } from './GoodsState';

export class GoodsBlockState extends GoodsState {
    
    public enterState(): void {
        this._goods.node.active = true;
        this._goods.sptGoods.color = Color.WHITE;
    }

    public exitState(): void {
        this._goods.node.active = true;
    }
}


