import { _decorator, Animation, Component, easing, Enum, instantiate, Node, Prefab, sp, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { EMoveType, EShelfType, IShelfData } from '../Data/ILevelData';
import { GoodsFactory } from '../Goods/GoodsFactory';
import { SlotContainer } from './Layer/SlotContainer';
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

    @property(Animation)
    animationShelf: Animation = null;

    @property(sp.Skeleton)
    skeletonLock: sp.Skeleton = null;

    @property({type: Enum(EMoveType)})
    moveType: EMoveType = EMoveType.NONE;

    @property(Lock)
    lock: Lock = null;

    @property(UIOpacity)
    uiQueueContainer: UIOpacity = null;

    @property(SlotContainer)
    activeSlotContainer: SlotContainer = null;

    @property(SlotContainer)
    queueSlotContainer: SlotContainer = null;

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
    
    private _slots: SlotContainer[] = [];

    protected abstract completeShelf(): void;

    protected update(dt: number): void {
        this.nodeShadow.worldPosition = this.nodeShadowAnchor.worldPosition;
        this._shelfStrategy?.move(dt);
    }

    public initialize(data: IShelfData): void {
        this.data = data;
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
        let currentData = this.data.itemsLayer.shift();
        let nextData = this.data.itemsLayer.shift();
        
        // Push goods vào activeSlotContainer
        currentData.items.forEach(item => {
            let goods = this.goodsFactory.createGoods(item);
            if (goods) {
                goods.shelf = this;
                goods.State = EGoodsState.ACTIVE;
                this.activeSlotContainer.set(goods);
            }
        });

        // Push goods vào queueSlotContainer
        if (nextData) {
            this.uiQueueContainer.node.active = true;
            nextData.items.forEach(item => {
                let goods = this.goodsFactory.createGoods(item);
                if (goods) {
                    goods.shelf = this;
                    goods.State = EGoodsState.INTERACTIVE;
                    this.queueSlotContainer.set(goods);
                }
            });
        }
        else {
            this.uiQueueContainer.node.active = false;
        }
        // Setup shadow
        this.nodeShadow.setParent(this.boxManager.levelLoader.nodeShadowContainer);
        this.nodeShadow.worldPosition = this.nodeShadowAnchor.worldPosition;
    }

    public reset(): void {
        this.activeSlotContainer.removeAll();
        this.queueSlotContainer.removeAll();
    }

    public onGoodsPickUp(goods: GoodsBase): void {
        this.activeSlotContainer.remove(goods);
        let listGoods =  this.activeSlotContainer.getAllGoods()
        // Nếu tất cả đều null thì push goods từ queueSlotContainer sang activeSlotContainer
        if (listGoods.every(goods => goods === null)) {
            this.pushGoodsToActiveSlotContainer();
            if (this.data.itemsLayer.length > 0) {
                this.pushGoodsToQueueSlotContainer();
            }
            else {
                this.uiQueueContainer.node.active = false;
            }
        }
    }

    public getGoods(): GoodsBase[] {
        return this.activeSlotContainer.getAllGoods();
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

    private pushGoodsToActiveSlotContainer(): void {
        this.queueSlotContainer.slots.forEach(slot => {

            let goods = slot.remove();
            if (goods) {
                this.activeSlotContainer.add(goods);
            }
        });
    }

    private pushGoodsToQueueSlotContainer(): void {
        let data = this.data.itemsLayer.shift();
        data.items.forEach(slot => {
            let goods = this.goodsFactory.createGoods(slot);
            if (goods) {
                goods.shelf = this;
                goods.State = EGoodsState.INTERACTIVE;
                this.queueSlotContainer.add(goods);
            }
        });
    }
}

