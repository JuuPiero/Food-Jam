import { _decorator, Component, easing, Enum, instantiate, Node, Prefab, sp, SpriteFrame, tween, Vec3 } from 'cc';
import { EMoveType, EShelfType, IShelfData } from '../Data/ILevelData';
import { GoodsFactory } from '../Goods/GoodsFactory';
import { ShelfLayer } from './Layer/ShelfLayer';
import { EGoodsState, Goods } from '../Goods/Goods';
import { BoxManager } from '../Core/BoxManager';
import { GoodsBase } from '../Base/GoodsBase';
import { ShelfStrategy } from './Strategy/ShelfStrategy';
import { Lock } from '../Lock/Lock';

const { ccclass, property } = _decorator;

export enum EShelfState {
    LOCKED,
    UNLOCKED
}

@ccclass("Shelf")
export abstract class Shelf extends Component {
    
    @property(Node)
    nodeShadow: Node = null;

    @property(Node)
    nodeShadowAnchor: Node = null;

    @property(Prefab)
    prefabLayer: Prefab = null;

    @property(Node)
    nodeLayers: Node = null;

    @property(Node)
    shelfCloseLid: Node = null;

    @property(sp.Skeleton)
    skeletonLock: sp.Skeleton = null;

    @property({type: Enum(EMoveType)})
    moveType: EMoveType = EMoveType.NONE;

    @property(Lock)
    lock: Lock = null;

    private _moveType: EMoveType = EMoveType.NONE;
    public set MoveType(value: EMoveType) {
        this._moveType = value;
        this.changeMoveType(this._moveType);
    }
    public get MoveType(): EMoveType {
        return this._moveType;
    }

    private _state: EShelfState = EShelfState.UNLOCKED;
    public set State(value: EShelfState) {
        this._state = value;
        this.changeState(this._state);
    }
    public get State(): EShelfState {
        return this._state;
    }

    public isTutShelf: boolean;
    public boxManager: BoxManager = null;
    public goodsFactory: GoodsFactory = null;
    public currentLayer: ShelfLayer = null;
    public top: Shelf = null;
    public bottom: Shelf = null;
    public left: Shelf = null;
    public right: Shelf = null;
    public locked: boolean = false;

    
    private _shelfStrategy: ShelfStrategy = null;
    
    private _layers: ShelfLayer[] = [];

    protected abstract completeShelf(): void;

    protected update(dt: number): void {
        this.nodeShadow.worldPosition = this.nodeShadowAnchor.worldPosition;
        this._shelfStrategy?.move(dt);
    }

    public initialize(data: IShelfData): void {
        // Clear
        this.reset();
        if (this.skeletonLock) {
            if (data.locked && data.locked > 0) {
                this.skeletonLock.node.parent.active = true;
                this.lock && this.lock.initialize(data.locked);
            }
            else {
                this.skeletonLock.node.parent.active = false;
            }
        }
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
        // Setup shadow
        this.nodeShadow.setParent(this.boxManager.levelLoader.nodeShadowContainer);
        this.nodeShadow.worldPosition = this.nodeShadowAnchor.worldPosition;
    }

    public reset(): void {
        this.nodeLayers.removeAllChildren();
    }

    public onGoodsPickUp(goods: GoodsBase): void {
        this.currentLayer.removeGoods(goods).then(goods => {
            if (goods.length === 0) {
                this.showNextLayer();
            }
        });
    }

    public complete(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // Hide current shelf
            // await this.hide();
            // this.hide();
            await this._shelfStrategy?.complete();
            // Get top
            let shelf = this.top;
            while (true) {
                if (shelf) {
                    shelf.fall();
                    shelf = shelf.top;
                    continue;
                }
                break;
            }
        });
    }

    public fall(): void {
        if (this.MoveType === EMoveType.FALLING) {
            let shelf = this.getBottomWPos();
            if (shelf) {
                let wPos = this.bottom.node.getWorldPosition();
                tween(this.node).to(0.3, {worldPosition: wPos}, {easing: easing.cubicOut})
                    .call(() => {
                        this.bottom = shelf;
                    }).start();
                
            }
        }
    }

    protected changeState(state: EShelfState): void {

    }

    protected changeMoveType(type: EMoveType): void {
        switch (type) {
            case EMoveType.LEFT_TO_RIGHT:
                break;
            case EMoveType.RIGHT_TO_LEFT:
                break;
            case EMoveType.TOP_TO_BOTTOM:
                break;
            case EMoveType.BOTTOM_TO_TOP:
                break;
            case EMoveType.FALLING:
                this._shelfStrategy = new FallingShelf(this);
                break;
        }
    }

    protected showNextLayer(): void {
        let index = this._layers.indexOf(this.currentLayer);
        if (index > -1) {
            this._layers.splice(index, 1);
            this.updateLayer();
        }
    }

    protected updateLayer(): void {
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
            this.complete();
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

    protected shelfCleared()
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

    // Đệ quy lấy position bên dưới
    private getBottomWPos(): Shelf {
        let shelf = this.bottom;
        while (true) {
            if (!shelf) {
                return null;
            }
            if (shelf && shelf.node.active) {
                break;
            }
            if (!shelf.bottom)
                break;
            shelf = shelf.bottom;
        }
        return shelf;
    }

    private hide(): Promise<void> {
        return new Promise((resolve, reject) => {
            let duration = 0.3;
            tween(this.nodeShadow).to(duration, {scale: Vec3.ZERO}, {easing: easing.cubicOut}).start();
            tween(this.node).to(duration, {scale: Vec3.ZERO}, {easing: easing.cubicOut})
                .call(() => {
                    this.node.active = false;
                    this.nodeShadow.active = false;
                    resolve();
                })
                .start();
        });
    }
}

