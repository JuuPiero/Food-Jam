import { _decorator, Component, Layers, Node, tween, Vec3 } from 'cc';
import { EGoodsState, Goods } from '../../Goods/Goods';
import { Shelf } from '../Shelf';
import { GoodsBase } from '../../Base/GoodsBase';

const { ccclass, property } = _decorator;

@ccclass('ShelfLayer')
export class ShelfLayer extends Component {
    
    @property([Node])
    nodesPosition: Node[] = [];

    public shelf: Shelf = null;
    private _goods: GoodsBase[] = [];

    public initialize(goods: GoodsBase[]): void {
        this.reset();
        this._goods = goods.filter(good => good !== null);
        for (let i = 0; i < goods.length; i++) {
            if (goods[i]) {
                this.nodesPosition[i].addChild(goods[i].node);
            }
        }
    }
    
    public reset(): void {
        this.nodesPosition.forEach(node => {
            node.removeAllChildren();
        });
    }

    public removeGoods(goods: GoodsBase): Promise<GoodsBase[]> {
        return new Promise((resolve, reject) => {
            let index = this._goods.indexOf(goods);
            if (index !== -1) {
                this._goods.splice(index, 1);
                resolve(this._goods);
            } else {
                reject(null);
            }
        });
    }

    public getGoods(): GoodsBase[] {
        return this._goods;
    }

    public show(): void {
        this._goods.forEach(good => {
            if (good)
                good.State = EGoodsState.ACTIVE;
        });
        tween(this.node).to(0.3, { position: Vec3.ZERO }, { easing: 'smooth' }).start();
    }

    public empty(): boolean {
        let result = false;
        this._goods.forEach(good => {
            if (good)
                result = true;
        });
        return result;
    }
}


