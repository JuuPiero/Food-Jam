import { _decorator, Component, Layers, Node } from 'cc';
import { Goods } from '../../Goods/Goods';
import { Shelf } from '../Shelf';

const { ccclass, property } = _decorator;

@ccclass('ShelfLayer')
export class ShelfLayer extends Component {
    
    @property([Node])
    nodesPosition: Node[] = [];

    public shelf: Shelf = null;
    private _goods: Goods[] = [];

    public initialize(goods: Goods[]): void {
        this.reset();
        this._goods = goods;
        for (let i = 0; i < goods.length; i++) {
            goods[i].shelfLayer = this;
            this.nodesPosition[i].addChild(goods[i].node);
        }
    }

    public reset(): void {
        this.nodesPosition.forEach(node => {
            node.removeAllChildren();
        });
    }

    public removeGoods(goods: Goods): Promise<Goods[]> {
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

    private complete(): void {
        this.shelf
    }
}


