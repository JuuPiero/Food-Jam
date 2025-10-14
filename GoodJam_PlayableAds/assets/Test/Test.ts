import { _decorator, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property(Sprite)
    sprite: Sprite = null;

    @property([Node])
    points: Node[] = [];

    start() {
        
    }

    update(deltaTime: number) {
        
    }
}


