import { _decorator, Component, find, Node, tween, UIOpacity, Vec3 } from 'cc';
import { EGoodsState, Goods } from '../Goods/Goods';
import { BezierTween } from '../Modules/BezierTween';
import { LevelLoader } from '../Core/LevelLoader';
import { BoxManager } from '../Core/BoxManager';
import { TutorialController } from '../Core/TutorialController';
import { ISlot } from './ISlot';
import { GoodsBase } from '../Base/GoodsBase';
import { Random } from '../Modules/Random';

const { ccclass, property } = _decorator;

@ccclass('Slot')
export class Slot extends Component implements ISlot {
    
    @property(Node)
    nodeParent: Node = null;

    public levelLoader: LevelLoader = null;
    public boxManager: BoxManager = null;
    protected _goodsId: number = -1;
    protected _isFull: boolean = false;
    protected _goods: GoodsBase = null;

    protected onLoad(): void {
        this.boxManager = find("").getComponentInChildren(BoxManager);
    }

    public reset(): void {
        this._isFull = false;
        this.nodeParent.removeAllChildren();
    }

    public set(goods: GoodsBase, state?: EGoodsState): void {
        this._goods = goods;
        this._isFull = true;
        this._goods.slot = this;
        goods.node.setParent(this.nodeParent, true);
        goods.node.setPosition(new Vec3(0,0,0));
        if (state) {
            goods.State = state;
        }
    }

    public add(goods: GoodsBase, state?: EGoodsState): Promise<Goods> {
        return new Promise((resolve, reject) => {
            this._goods = goods;
            this._isFull = true;
            this._goods.slot = this;

            let duration = 0.5;

            // Start
            let worldPos = goods.node.getWorldPosition();
            let worldScale = goods.node.getWorldScale();
            let nodeTopLayer = this.boxManager.nodeTopLayer;
            goods.node.setParent(nodeTopLayer, true);
            goods.node.setWorldPosition(worldPos);
            goods.node.setWorldScale(worldScale);
            
            if (state) {
                goods.State = state;
            }
            
            // End
            let endPos = this.nodeParent.getWorldPosition();
            let endScale = this.nodeParent.getWorldScale();

            // Tạo điểm để move curve

            tween(goods.node).to(duration, {worldScale: endScale}).start();
            BezierTween(goods.node, duration + 0.1, this.nodeParent, new Vec3(0, 800, 0)).then(() => {
                goods.node.setParent(this.nodeParent, true);
                // goods.node.setWorldPosition(endPos);
                goods.node.setWorldScale(endScale);
                goods.State = EGoodsState.ACTIVE;
                // if (this.nodeParent.children.length > 1) debugger
                resolve(goods as Goods);
            });
        });
    }

    public remove(): GoodsBase
    {
        this._isFull = false;
        let goods = this._goods;
        goods.node.parent = null;
        this._goods = null;
        return goods;
    }

    public addTut(goods: Goods): Promise<Goods> {
        return new Promise((resolve, reject) => {
            setTimeout(()=>{
            this._goods = goods;
            this._isFull = true;
            let duration = 1;

            // Start
            let originalParent = goods.node.parent;
            let worldPos = goods.node.getWorldPosition();
            let worldScale = goods.node.getWorldScale();
            let nodeTopLayer = this.boxManager.nodeTopLayer;
            goods.node.parent = nodeTopLayer;
            goods.node.setWorldPosition(worldPos);
            goods.node.setWorldScale(worldScale);
            
            // End
            let endPos = this.nodeParent.getWorldPosition();
            
            let endScale = this.nodeParent.getWorldScale();

            // Tạo điểm để move curve
            let p2 = new Vec3(endPos.x, endPos.y + 500, endPos.z);
          
            tween(goods.node).to(duration, {worldScale: endScale}).start();
            BezierTween(goods.node, duration + 0.1, this.nodeParent, new Vec3(0, 500, 0))
            .then(()=>{
                tween(goods.node)
                .to(.1,{scale: new Vec3(goods.node.getScale().x*1.25,goods.node.getScale().y *.75,goods.node.getScale().z)})
                .call(()=>{
                    tween(goods.node)
                    .to(.1,{scale: new Vec3(goods.node.getScale().x/1.25,goods.node.getScale().y /.75,goods.node.getScale().z)})
                    .start();
            })
                .start();
                setTimeout(()=>{
                goods.node.setParent(originalParent, true);
                goods.node.setScale(new Vec3(1,1,1));
                goods.node.setPosition(new Vec3(0,0,0));
                if(TutorialController.Instance.tutBool)
                    this.addTut(goods);
                
            },500)
            });
        },1000)
            // .then(() => {
            //     goods.node.parent = this.nodeParent;
            //     goods.node.setWorldPosition(endPos);
            //     goods.node.setWorldScale(endScale);
            //     resolve(goods);
            // });
        });
    }
    public isFull(): boolean {
        return this._isFull;
    }

    public getGoods(): GoodsBase {
        return this._goods;
    }
}


