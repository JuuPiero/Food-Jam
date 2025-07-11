import { _decorator, Animation, AudioSource, Component, easing, Label, Node, tween, Vec3 } from 'cc';
import { Coin } from './Goods/Coin';
import { BoxManager } from './Core/BoxManager';
import { BezierTween } from './Modules/BezierTween';
const { ccclass, property } = _decorator;

@ccclass('CollectCoin')
export class CollectCoin extends Component {
    
    @property(Node)
    nodeCoin: Node = null;

    @property(Label)
    labelCoin: Label = null;

    @property(Animation)
    animCoin: Animation = null;

    @property(BoxManager)
    boxManager: BoxManager = null;

    @property
    totalCoin: number = 0;

    @property(AudioSource)
    audioCoin: AudioSource = null;

    private _currentCoin: number = 0;

    private static _instance: CollectCoin = null;
    public static get Instance(): CollectCoin {
        return this._instance;
    }

    protected onLoad(): void {
        CollectCoin._instance = this;
    }

    public collect(coin: Coin): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let wScale = coin.node.getWorldScale();
            let wPos = coin.node.getWorldPosition();
            
            coin.node.setParent(this.boxManager.nodeTopLayer);
            coin.node.setWorldPosition(wPos);
            coin.node.setWorldScale(wScale);

            this._currentCoin++;

            let endPos = this.nodeCoin.getWorldPosition();
            let endScale = this.nodeCoin.getWorldScale();

            // Tạo điểm để move curve
            let p2 = new Vec3(endPos.x, endPos.y + 500, endPos.z);

            tween(coin.node).to(0.5, {worldPosition: endPos}, {easing: easing.cubicOut})
            .call(() => {
                this.audioCoin.play();
                this.labelCoin.string = this._currentCoin.toString() + "/" + this.totalCoin.toString();
                this.animCoin.play();
                coin.node.destroy();
                resolve(this._currentCoin === this.totalCoin);
            }).start();
        });
    }
}