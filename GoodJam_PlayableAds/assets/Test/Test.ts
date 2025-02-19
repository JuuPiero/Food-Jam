import { _decorator, Component, easing, Node, Sprite } from 'cc';
import { tween } from '../Scripts/TweenUtils';
import { BezierTween } from '../Scripts/Modules/BezierTween';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property(Sprite)
    sprite: Sprite = null;

    @property([Node])
    points: Node[] = [];

    start() {
        this.scheduleOnce(() => {
            BezierTween(this.sprite.node, 1, this.points[0].getWorldPosition(), this.points[1].getWorldPosition(), this.points[2].getWorldPosition())
        }, 2)
    }

    update(deltaTime: number) {
        
    }
}


