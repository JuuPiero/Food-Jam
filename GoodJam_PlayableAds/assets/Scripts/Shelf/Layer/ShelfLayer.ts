import { _decorator, Component, easing, Node, tween, UIOpacity } from 'cc';
import { Slot } from '../../Slot/Slot';
import { IItemsLayerData } from '../../Data/ILevelData';
import { Shelf } from '../Shelf';
import { GoodsFactory } from '../../Goods/GoodsFactory';
import { EGoodsState } from '../../Goods/Goods';
import { GoodsBase } from '../../Base/GoodsBase';
import { AudioManager, ESoundEffect } from '../../AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ShelfLayer')
export class ShelfLayer extends Component {
    
    @property(UIOpacity)
    uiLayer: UIOpacity = null;

    @property([Slot])
    slots: Slot[] = [];

    public shelf: Shelf = null;

    public initialize(data: IItemsLayerData, state?: EGoodsState): ShelfLayer {
        let goodsFactory: GoodsFactory = GoodsFactory.Instance;
        this.slots.forEach((slot, index) => {
            slot.remove();
            let goods = goodsFactory.createGoods(data.items[index]);
            goods.shelf = this.shelf;
            slot.set(goods, state);
        });
        return this;
    }

    public setState(state: EGoodsState): void {
        this.slots.forEach(slot => {
            let goods = slot.getGoods();
            if (goods) {
                goods.State = state;
            }
        });
    }

    public getAllGoods(): GoodsBase[] {
        return this.slots.map(slot => slot.getGoods());
    }

    public remove(goods: GoodsBase): GoodsBase {
        return this.slots.find(slot => slot.getGoods() === goods).remove();
    }

    public removeAll(): void {
        this.slots.forEach(slot => {
            slot.remove();
        });
    }

    public wakeUp(shelf: Shelf): void {
        shelf.mainLayer.slots.forEach((slot, index) => {
            let goods = this.slots[index].remove();
            if (goods) {
                slot.add(goods, EGoodsState.ACTIVE);
            }
        });
        
        this.hide();

        let random = Math.random();
        this.scheduleOnce(() => {
            AudioManager.playEffect(ESoundEffect.MEAT);
        }, random);
    }

    public sleep(): void {
        this.slots.forEach(slot => {
            let goods = slot.getGoods();
            if (goods) {
                goods.State = EGoodsState.INTERACTIVE;
            }
        });
    }

    private hide(): void {
        let duration = 0.3;
        tween(this.uiLayer)
        .to(duration, {opacity: 0}, {easing: easing.cubicOut})
        .call(() => {
            this.uiLayer.node.active = false;
        })
        .start();
    }
}


