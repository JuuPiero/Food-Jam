import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { Goods } from '../Goods/Goods';
import { BezierTween } from '../Modules/BezierTween';
const { ccclass, property } = _decorator;

export enum ESlotType {
    EMPTY,
    FULL
}

@ccclass('Slot')
export class Slot extends Component {
    
    @property(Node)
    nodeParent: Node = null;

    // Point for bezier tween
    @property(Node)
    point: Node = null;

    public state: ESlotType = ESlotType.EMPTY;

    public add(goods: Goods): Promise<Goods> {
        return new Promise((resolve, reject) => {
            this.state = ESlotType.FULL;
            let worldScale = goods.node.getWorldScale();
            let worldPos = goods.node.getWorldPosition();
            goods.node.parent = this.nodeParent;
            goods.node.setWorldPosition(worldPos);
            goods.node.setWorldScale(worldScale);

            let p2 = this.point.getWorldPosition();
            
            BezierTween(goods.node, 0.5, worldPos, p2, Vec3.ZERO.clone()).then(() => {

            });
        });
    }
}


