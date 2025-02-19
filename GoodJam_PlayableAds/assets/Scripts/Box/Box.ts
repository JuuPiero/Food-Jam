import { _decorator, Animation, Component, easing, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { IBox } from '../Base/Interfaces/IBox';
import { LevelLoader } from '../Core/LevelLoader';
import { BoxSlot } from '../Slot/BoxSlot';
import { Goods } from '../Goods/Goods';
import { BoxManager } from '../Core/BoxManager';
const { ccclass, property } = _decorator;

export enum EBoxAnimation {
    IDLE = "BoxIdle",
    COMPLETE = "BoxComplete"
}

@ccclass('Box')
export class Box extends Component implements IBox {

    @property(Animation)
    animBox: Animation = null;

    @property(Prefab)
    prefabSlot: Prefab = null;

    @property(Node)
    nodeSlots: Node = null;

    public levelLoader: LevelLoader = null;
    public boxManager: BoxManager = null;
    protected _boxId: number = -1;
    protected _total: number = 0;
    protected _boxSlots: BoxSlot[] = [];
    protected _count: number = 0;

    public initialize(id: number, count: number): void {
        this.reset();
        this._boxId = id;
        this._total = count;
        this.initSlots();
        console.log("%cID: " + this._boxId, "color: blue");
    }

    public reset(): void {
        this.animBox.play(EBoxAnimation.IDLE);
        this.nodeSlots.removeAllChildren();
        this._count = 0;
        this._boxId = -1;
        this._total = 0;
        this._boxSlots.length = 0;
    }

    public complete(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.animBox.play(EBoxAnimation.COMPLETE);
            this.scheduleOnce(() => {
                tween(this.node).to(0.5, {position: new Vec3(0, 300, 0)}, {easing: easing.cubicOut})
                    .call(() => {
                        resolve();
                    }).start();
            }, 0.8);
        });
    }

    public getId(): number {
        return this._boxId;
    }

    public add(goods: Goods): void {
        for (let i = 0; i < this._boxSlots.length; i++) {
            let boxSlot = this._boxSlots[i];
            if (boxSlot.isFull()) {
                continue;
            }
            boxSlot.add(goods).then(goods => {
                goods.animGoods.play("GoodsJump");
                this._count++;
                if (this._count === this._total) {
                    this.complete().then(() => {
                        this.boxManager.onBoxComplete(this);
                    });
                }
            })
            return;
        }
    }
    
    private initSlots(): void {
        for (let i = 0; i < this._total; i++) {
            let node = instantiate(this.prefabSlot);
            this.nodeSlots.addChild(node);

            let boxSlot = node.getComponent(BoxSlot);
            boxSlot.levelLoader = this.levelLoader;
            boxSlot.boxManager = this.boxManager;
            boxSlot.setHiddenGoods(this._boxId);
            this._boxSlots.push(boxSlot);
        }
    }
}


