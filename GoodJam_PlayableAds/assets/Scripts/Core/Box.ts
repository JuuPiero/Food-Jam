import { _decorator, Animation, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Box')
export class Box extends Component {
    @property(Animation)
    animBox: Animation = null;

    @property({ type: Sprite })
    private icon: Sprite;
    @property({ type: Label })
    private countTxt: Label;

    public id: number;
    public count: number;

    public Init(id: number, count: number, sprite: SpriteFrame) {
        this.id = id;
        this.count = count;

        this.icon.spriteFrame = sprite;
        this.countTxt.string = count.toString();

        this.animBox.play("IdleBox");
    }

    public Collect(): boolean {
        this.count--;
        setTimeout(() => {
            this.countTxt.string = this.count.toString();
        }, 300);

        if (this.count <= 0){
            // play fx 
            return true;
        }
        return false;
    }
}


