import { _decorator, Button, Component, Enum, Node } from 'cc';
import { tween, Vec3 } from 'cc';
import { TouchManager } from '../TouchManager';
import { GameManager } from '../../GameManager';
import { PlayableAdsManager } from 'db://assets/base-script/PlayableAds/PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass('ScaleAnimation')
export class ScaleAnimation extends Component {

    button: Button = null;

    @property
    scale1: number = 0.9;

    @property
    scale2: number = 1;

    mTween: any = null;
    start() {
        this.node.scale = Vec3.ONE.clone().multiplyScalar(this.scale1);
        this.button = this.getComponent(Button);
        if (this.button == null) { console.error("Button is null__" + this.node.name); }
        else { this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this); }
        // Lưu lại kích thước ban đầu của đối tượng
        //Tween thu nhỏ đối tượng từ kích thước hiện tại về (0.5, 0.5, 1) trong 1 giây
        this.mTween = tween(this.node)
            .to(.7, { scale: new Vec3(1, 1, 1).multiplyScalar(this.scale1) })
            .to(.7, { scale: new Vec3(1, 1, 1).multiplyScalar(this.scale2) })  // Tween trở lại kích thước ban đầu trong 1 giây
            .union()  // Kết hợp tween trên với tween dưới
            .repeatForever()  // Lặp lại vô hạn
            .start();
    }

    restart() {
        this.node.scale = Vec3.ONE.clone().multiplyScalar(this.scale1);
        if (this.mTween != null)
            this.mTween.stop();
        this.mTween = tween(this.node)
            .to(.7, { scale: new Vec3(1, 1, 1).multiplyScalar(this.scale1) })
            .to(.7, { scale: new Vec3(1, 1, 1).multiplyScalar(this.scale2) })  // Tween trở lại kích thước ban đầu trong 1 giây
            .union()  // Kết hợp tween trên với tween dưới
            .repeatForever()  // Lặp lại vô hạn
            .start();
    }
    protected onDestroy(): void {
        if (this.button != null)
            this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }
    onTouchStart() {
        if (TouchManager.instance != null && !TouchManager.instance.clickedAlready)
            TouchManager.instance.onTouchStart();
        PlayableAdsManager.getInstance().OpenStore();
    }
}


