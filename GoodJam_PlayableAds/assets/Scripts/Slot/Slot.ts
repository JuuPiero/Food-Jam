import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
import { Goods } from '../Goods/Goods';
import { BezierTween } from '../Modules/BezierTween';
import { LevelLoader } from '../Core/LevelLoader';
import { BoxManager } from '../Core/BoxManager';
import { TutorialController } from '../Core/TutorialController';
import { AudioManager, ESoundEffect } from '../AudioManager';
const { ccclass, property } = _decorator;

@ccclass('Slot')
export class Slot extends Component {
    
    @property(Node)
    nodeParent: Node = null;

    public levelLoader: LevelLoader = null;
    public boxManager: BoxManager = null;
    protected _goodsId: number = -1;
    protected _isFull: boolean = false;
    protected _goods: Goods = null;

    public reset(): void {
        this._isFull = false;
        this.nodeParent.removeAllChildren();
    }

    public add(goods: Goods): Promise<Goods> {
        return new Promise((resolve, reject) => {
            this._goods = goods;
            this._isFull = true;
            let duration = 0.5;

            // Start
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
            BezierTween(goods.node, duration + 0.1, worldPos, p2, endPos).then(() => {
                goods.node.parent = this.nodeParent;
                goods.node.setWorldPosition(endPos);
                goods.node.setWorldScale(endScale);
                resolve(goods);
            });
        });
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
            BezierTween(goods.node, duration + 0.1, worldPos, p2, endPos)
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
                goods.node.parent = originalParent;
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
        return this.nodeParent.children.length > 0 || this._isFull;
    }

    public getGoods(): Goods {
        return this._goods;
    }
}


