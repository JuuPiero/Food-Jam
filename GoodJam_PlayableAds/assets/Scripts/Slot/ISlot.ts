import { GoodsBase } from "../Base/GoodsBase";
import { EGoodsState } from "../Goods/Goods";

export interface ISlot {
    add(goods: GoodsBase, state?: EGoodsState): Promise<GoodsBase>;
    set(goods: GoodsBase, state?: EGoodsState): void;
    remove(): GoodsBase;
    isFull(): boolean;
    getGoods(): GoodsBase;
}