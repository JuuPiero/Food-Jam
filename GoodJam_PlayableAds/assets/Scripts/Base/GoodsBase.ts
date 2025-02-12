import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GoodsBase')
export abstract class GoodsBase extends Component {
    
    public abstract initialize(id: number, spriteFrame: SpriteFrame): void;
    public abstract onClick(): void;
    public abstract reset(): void;
    
}


