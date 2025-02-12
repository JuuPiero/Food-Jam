import { _decorator, Component, easing, Node, Sprite } from 'cc';
import { tween } from '../Scripts/TweenUtils';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property(Sprite)
    sprite: Sprite = null;

    @property([Node])
    points: Node[] = [];

    start() {
        this.scheduleOnce(() => {
            tween(this.sprite.node).bezierTo(3,
                {position: this.points[0].getPosition()},
                {position: this.points[1].getPosition()},
                {position: this.points[2].getPosition()},
                {easing: easing.cubicOut}
            ).start();
        }, 2)
    }

    update(deltaTime: number) {
        
    }
}


