import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenSpriteSwap')
export class TweenSpriteSwap extends Component {
    @property(SpriteFrame)
    originalSprite : SpriteFrame = null;

    @property(SpriteFrame)
    changeSprite : SpriteFrame = null;

    @property
    duration: number = 0;

    @property
    delay: number = 0;

    protected start(): void {
        setTimeout(()=>{this.startTween();},this.delay*1000)
    }
    startTween()
    {
        if(this.getComponent(Sprite).spriteFrame == this.originalSprite)
        {
            this.getComponent(Sprite).spriteFrame = this.changeSprite;
        }
        else
        {
            this.getComponent(Sprite).spriteFrame = this.originalSprite;
        }
        setTimeout(()=>{this.startTween();},this.duration*1000)
    }
}


