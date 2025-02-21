import { _decorator, Component, instantiate, Node, Prefab, SpriteFrame } from 'cc';
import { Goods } from './Goods';
const { ccclass, property } = _decorator;

export enum EGoodsType {
    NORMAL,
    SINGLE
}

@ccclass('GoodsFactory')
export class GoodsFactory extends Component {
    
    @property(Prefab)
    prefabsGoods: Prefab = null;

    @property(Prefab)
    prefabsGoodsTut: Prefab = null;

    @property([SpriteFrame])
    sfrGoods: SpriteFrame[] = [];

    public createGoods(id: number): Goods {
        if (id === 0)
            return null;
        let node = instantiate(this.prefabsGoods);
        let goods = node.getComponent(Goods);
        goods.initialize(id, this.sfrGoods[id]);
        return goods;
    }
    public createGoodsTut(id: number): Goods {
        if (id === 0)
            return null;
        let node = instantiate(this.prefabsGoodsTut);
        let goods = node.getComponent(Goods);
        goods.initialize(id, this.sfrGoods[id]);
        return goods;
    }
    public getSpriteFrameByID(id: number): SpriteFrame {
        if (id === 0)
            return null;
        return this.sfrGoods[id];
    } 
}