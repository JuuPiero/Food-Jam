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

    @property([SpriteFrame])
    sfrGoods: SpriteFrame[] = [];

    public createGoods(id: number): Goods {
        let node = instantiate(this.prefabsGoods);
        let goods = node.getComponent(Goods);
        goods.initialize(id, this.sfrGoods[id]);
        return goods;
    }

    private getSpriteFrameByID(id: number): SpriteFrame {
        if (id === 0)
            return null;
        return this.sfrGoods[id];
    } 
}