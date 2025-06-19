import { _decorator, Component, easing, Node, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { Box } from '../Box/Box';
const { ccclass, property } = _decorator;

export enum EBoxEffect {
    NICE,
    GOOD_JOB,
    AWESOME,
    AMAZING,
    FANTASTIC
}

@ccclass('BoxEffect')
export class BoxEffect extends Component {

    @property(Sprite)
    sptTextEffect: Sprite = null;

    @property(UIOpacity)
    uiTextEffect: UIOpacity = null;

    @property([SpriteFrame])
    spfrTextCombo: SpriteFrame[] = [];

    public box: Box = null;

    private static _currentEffect: EBoxEffect = EBoxEffect.NICE;
    public static reset(): void {
        BoxEffect._currentEffect = EBoxEffect.NICE;
    }

    public show(): void {
        this.resetCounter();
        this.updateText();
        this.playEffect();
    }

    private resetCounter(): void {
        this.unschedule(BoxEffect.reset.bind(BoxEffect));
        this.scheduleOnce(BoxEffect.reset.bind(BoxEffect), 8);
    }

    private updateText(): void {
        let index = this.box.boxManager.textEffect.getRandomTextEffect();
        this.sptTextEffect.spriteFrame = this.spfrTextCombo[index];
    }

    private playEffect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.uiTextEffect.opacity = 0;
            this.uiTextEffect.node.scale = new Vec3(0.5, 0.5, 0.5);
            this.uiTextEffect.node.position = new Vec3(0, 80, 0);
            tween(this.uiTextEffect).to(0.3, {opacity: 255}, {easing: easing.cubicOut}).start();
            tween(this.uiTextEffect.node).to(0.3, {scale: new Vec3(1.8, 1.8, 1.8)}, {easing: easing.cubicOut})
                .call(() => {
                    tween(this.uiTextEffect).to(0.5, {opacity: 0}, {easing: easing.cubicOut}).start();
                })
                .by(0.5, {position: new Vec3(0, 200, 0)}, {easing: easing.cubicOut})
                .call(() => {
                    resolve();
                })
                .start();
        });
    }
}