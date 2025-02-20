import { _decorator, Component, easing, Enum, instantiate, Node, Prefab, SpriteFrame, tween, Vec3 } from 'cc';
import { EMoveType, EShelfType, IShelfData } from '../Data/ILevelData';
import { GoodsFactory } from '../Goods/GoodsFactory';
import { ShelfLayer } from './Layer/ShelfLayer';
import { EGoodsState, Goods } from '../Goods/Goods';
import { BoxManager } from '../Core/BoxManager';
const { ccclass, property } = _decorator;

@ccclass("Shelf")
export class Shelf extends Component {
    
    @property(Prefab)
    prefabLayer: Prefab = null;

    @property(Node)
    nodeLayers: Node = null;

    @property(Node)
    shelfCloseLid: Node = null;

    @property({type: Enum(EMoveType)})
    moveType: EMoveType = EMoveType.NONE;

   
    public isTutShelf: boolean;
    public boxManager: BoxManager = null;
    public goodsFactory: GoodsFactory = null;
    public currentLayer: ShelfLayer = null;
    
    private _layers: ShelfLayer[] = [];

    public initialize(data: IShelfData): void {
        // Clear
        this.reset();

        // Create
        for (let i = data.itemsLayer.length - 1; i >= 0; i--) {
            let itemsLayer = data.itemsLayer[i];
            let nodeLayer = instantiate(this.prefabLayer);
            this.nodeLayers.addChild(nodeLayer);
            let layer = nodeLayer.getComponent(ShelfLayer);
            layer.shelf = this;
            let list = [];
           
            for (let j = 0; j < itemsLayer.items.length; j++) {
                let item = itemsLayer.items[j];
                let goods = this.goodsFactory.createGoods(item);
                goods && (goods.shelf = this);
                list.push(goods);
            }
            layer.initialize(list);
            this._layers.push(layer);
        }

        // Setup
        this.updateLayer();
    }
    public tutAnim()
    {
        this.currentLayer.getGoods()[0].TutAnim();
     
    }
    public reset(): void {
        this.nodeLayers.removeAllChildren();
    }

    public onGoodsPickUp(goods: Goods): void {
        this.currentLayer.removeGoods(goods).then(goods => {
            if (goods.length === 0) {
                this.showNextLayer();
            }
        });
    }

    private showNextLayer(): void {
        let index = this._layers.indexOf(this.currentLayer);
        if (index > -1) {
            this._layers.splice(index, 1);
            this.updateLayer();
        }
    }
    private updateLayer(): void {
        this.currentLayer = this._layers[this._layers.length - 1]
        if (this.currentLayer) {
            let goods = this.currentLayer.getGoods();
            goods.forEach(good => {
                if (good)
                    good.State = EGoodsState.ACTIVE;
            });
            this.currentLayer.node.active = true;
            tween(this.currentLayer.node).to(0.5, {position: new Vec3(0, 0, 0)}, {easing: easing.cubicOut}).start();
        }
        else
        {
            this.shelfCleared();
            return;
        }
        let nextLayer = this._layers[this._layers.length - 2];
        if (nextLayer) {
            let goods = nextLayer.getGoods();
            goods.forEach(good => {
                if (good)
                    good.State = EGoodsState.INTERACTIVE;
            });
            nextLayer.node.active = true;
            nextLayer.node.position = new Vec3(0, 20, 0);
        }
        for (let i = this._layers.length - 3; i >= 0; i--) {    
            let layer = this._layers[i];
            let goods = layer.getGoods();
            goods.forEach(good => {
                if (good)
                    good.State = EGoodsState.HIDDEN;
            });
            layer.node.active = false;
        }
    }
    shelfCleared()
    {
        if(!this.shelfCloseLid)
            return;
        tween(this.shelfCloseLid).to(0.3, {position: new Vec3(0, 0, 0)})
        .call(()=>
            {
                tween(this.shelfCloseLid).to(0.15, {position: new Vec3(0, 20, 0)})
                .call(()=>
                    {
                        tween(this.shelfCloseLid).to(0.15, {position: new Vec3(0, 0, 0)})
                        .start();
                    })
                    .start();
                    
            })
        .start();
    }
}

