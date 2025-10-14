import { _decorator, Animation, Component, easing, Enum, instantiate, Node, Prefab, sp, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { EMoveType, EShelfType, IShelfData } from '../Data/ILevelData';
import { GoodsFactory } from '../Goods/GoodsFactory';
import { SlotContainer } from './Layer/SlotContainer';
import { EGoodsState, Goods } from '../Goods/Goods';
import { BoxManager } from '../Core/BoxManager';
import { GoodsBase } from '../Base/GoodsBase';
import { ShelfStrategy } from './Strategy/ShelfStrategy';
import { Lock } from '../Lock/Lock';
import { AudioManager, ESoundEffect } from '../AudioManager';
import { ShelfLayer } from './Layer/ShelfLayer';
import { Queuelayer } from './QueueLayer';
import { Random } from '../Modules/Random';
import { PromiseUtils } from '../PromiseUtils';

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

    @property(Animation)
    animationShelf: Animation = null;

    @property(sp.Skeleton)
    skeletonLock: sp.Skeleton = null;

    @property({type: Enum(EMoveType)})
    moveType: EMoveType = EMoveType.NONE;

    @property(Lock)
    lock: Lock = null;

    @property(ShelfLayer)
    mainLayer: ShelfLayer = null;

    @property(Queuelayer)
    queueLayer: Queuelayer = null;

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
    public top: Shelf = null;
    public bottom: Shelf = null;
    public left: Shelf = null;
    public right: Shelf = null;
    public locked: boolean = false;
    public data: IShelfData = null;
    public currentLayer: GoodsBase[] = [];
    public nextLayer: GoodsBase[] = [];
    
    private _shelfStrategy: ShelfStrategy = null;

    protected abstract completeShelf(): void;

    protected update(dt: number): void {
        this.nodeShadow.worldPosition = this.nodeShadowAnchor.worldPosition;
        this._shelfStrategy?.move(dt);
    }

    public initialize(data: IShelfData): void {
        this.data = JSON.parse(JSON.stringify(data));
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
        // Khởi tạo item trên vỉ nướng
        let mainData = this.data.itemsLayer.shift();
        this.mainLayer.shelf = this;
        this.mainLayer.initialize(mainData, EGoodsState.ACTIVE);

        // Khởi tạo item ở hàng chờ
        this.queueLayer.shelf = this;
        this.queueLayer.initialize(this.data.itemsLayer);

        // Setup shadow
        this.nodeShadow.setParent(this.boxManager.levelLoader.nodeShadowContainer);
        this.nodeShadow.worldPosition = this.nodeShadowAnchor.worldPosition;

    }

    public reset(): void {
        this.mainLayer?.removeAll();
        this.queueLayer?.removeAll();
    }

    public onGoodsPickUp(goods: GoodsBase): void {
        this.mainLayer.remove(goods);
        let listGoods =  this.mainLayer.getAllGoods()
        for (let i = 0; i < listGoods.length; i++)
        {
            console.log("Goods left on shelf: ", listGoods[i]);
        }
        if (listGoods.every(goods => goods === null) || this.mainLayer.slots.length === 0) {
            let shelfLayer = this.queueLayer.pop();
            if (shelfLayer) {
                shelfLayer.wakeUp(this);
            }
            else {
                this.close();
            }
        }
    }

    public getGoods(): GoodsBase[] {
        return this.mainLayer.getAllGoods();
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

    public close(): void {
        this.animationShelf.play("ShelfComplete");
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
                // Strategy not used currently
                break;
        }
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

    private playRandomEffectSmoke(): void {
        this.mainLayer.slots.forEach(async slot => {
            let goods = slot.getGoods() as Goods;
            if (goods) {
                let num = Random.getRandomInt(0, 100);
                if (num < 10) {
                    await PromiseUtils.delay(Math.random());
                    goods.playSmokeAnim();
                }
            }
        });
    }

    public getActiveGoods() : GoodsBase[] {
        return this.mainLayer.getActiveGoods();
    }

    public getInQueueItems(): {good : GoodsBase, stepToTop: number, shelf: Shelf}[] {
        const res: {good : GoodsBase, stepToTop: number, shelf: Shelf}[] = [];
        const q = this.queueLayer.peek()
        const step = this.getActiveGoods().length;
        if (q)
        {
            q.slots.forEach((slot, index) => {
                const good = slot.getGoods();
                if (good)
                {
                    res.push({good: good, stepToTop: step, shelf: this});
                }
            });
        }
        return res;
    }

    public selectRandomGood(): void 
    {
        const goods = this.mainLayer.getAllGoods().filter(g => g !== null);
        if (goods.length > 0) {
            const good = goods[0];
            good.onClick();
        }
    }
}

