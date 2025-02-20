import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { Goods } from '../Goods/Goods';
import { BezierTween } from '../Modules/BezierTween';
import { LevelLoader } from '../Core/LevelLoader';
import { BoxManager } from '../Core/BoxManager';
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

    public isFull(): boolean {
        return this.nodeParent.children.length > 0 || this._isFull;
    }

    public getGoods(): Goods {
        return this._goods;
    }
}


