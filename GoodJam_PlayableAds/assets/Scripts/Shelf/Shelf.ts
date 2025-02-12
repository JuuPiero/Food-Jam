import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { IShelfData } from '../Data/ILevelData';
import { GoodsFactory } from '../Goods/GoodsFactory';
import { ShelfLayer } from './Layer/ShelfLayer';
const { ccclass, property } = _decorator;

@ccclass("Shelf")
export class Shelf extends Component {
    
    @property(Prefab)
    prefabLayer: Prefab = null;

    @property(Node)
    nodeLayers: Node = null;

    public goodsFactory: GoodsFactory = null;
    public currentLayer: ShelfLayer = null;
    
    private _layers: ShelfLayer[] = [];

    public initialize(data: IShelfData): void {
        // Clear
        this.reset();

        // Create
        for (let i = 0; i < data.itemsLayer.length; i++) {
            let itemsLayer = data.itemsLayer[i];
            let nodeLayer = instantiate(this.prefabLayer);
            this.nodeLayers.addChild(nodeLayer);
            let layer = nodeLayer.getComponent(ShelfLayer);
            layer.shelf = this;
            let list = [];
            for (let j = 0; j < itemsLayer.items.length; j++) {
                let item = itemsLayer.items[j];
                let goods = this.goodsFactory.createGoods(item);
                list.push(goods);
            }
            layer.initialize(list);
            this._layers.push(layer);
        }

        // Setup

    }

    public reset(): void {
        this.nodeLayers.removeAllChildren();
    }
}


