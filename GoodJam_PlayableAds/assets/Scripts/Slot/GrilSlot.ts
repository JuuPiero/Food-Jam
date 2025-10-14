import { _decorator, Component, easing, Node, tween, Vec3 } from 'cc';
import { Slot } from './Slot';
import { GoodsBase } from '../Base/GoodsBase';
import { EGoodsState, Goods } from '../Goods/Goods';
const { ccclass, property } = _decorator;

@ccclass('GrilSlot')
export class GrilSlot extends Slot {
    
    public set(goods: GoodsBase, state?: EGoodsState): void
    {
        
        this._goods = goods;
        this._isFull = true;
        goods.slot = this;
        goods.node.setParent(this.nodeParent);
        goods.node.setPosition(new Vec3(0,0,0));
        if (state) {
            goods.State = state;
        }
    }

    public add(goods: Goods, state?: EGoodsState): Promise<Goods> {
        return new Promise((resolve, reject) => {
            this._goods = goods;
            this._isFull = true;
            goods.slot = this;
            goods.node.setParent(this.nodeParent, true);
            let endPos = this.nodeParent.getWorldPosition();
            let endScale = this.nodeParent.getWorldScale();
            
            let duration = 0.5;

            tween(goods.node).parallel(
                tween(goods.node).to(duration, {eulerAngles: new Vec3(0,0,0)}, {easing: easing.cubicOut}),
                tween(goods.node).to(duration, {worldPosition: endPos}, {easing: easing.cubicOut}),
                tween(goods.node).to(duration, {scale: new Vec3(1, 1, 1)}, {easing: easing.cubicOut})
            ).call(() => {
                if (state) {
                    goods.State = state;
                }
                resolve(goods);
            }).start();
        });
    }

    public remove(): GoodsBase
    {
        console.log("Remove goods from slot: ", this._goods);
        this._isFull = false;
        let goods = this._goods;
        this._goods = null;
        return goods;
    }
    
}


