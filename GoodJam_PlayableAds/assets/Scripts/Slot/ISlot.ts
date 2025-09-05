import { GoodsBase } from "../Base/GoodsBase";

export interface ISlot {
    add(goods: GoodsBase): Promise<GoodsBase>;
    set(goods: GoodsBase): void;
    remove(): GoodsBase;
    isFull(): boolean;
    getGoods(): GoodsBase;
}