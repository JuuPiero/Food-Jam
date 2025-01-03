import { _decorator, Component, EventTouch, Input, input, Node, NodeEventType } from 'cc';
import { GameManager } from './GameManager';
import { EGameState } from './EGameState';
import { TrackingManager } from '../../base-script/PlayableAds/Tracking/TrackingManager';
import { AudioManager } from '../AudioManager';
import { PlayableAdsManager } from '../../base-script/PlayableAds/PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass('TouchEventListener')
export class TouchEventListener extends Component {
    
    private _firstTouch: boolean = false;
    public static instance: TouchEventListener = null;

    protected onLoad(): void {
        TouchEventListener.instance = this;
    }

    protected onEnable(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public checkFirstClicked(): boolean {
        return this._firstTouch;
    }

    private onTouchStart(event: EventTouch): void {
        console.log('TouchEventListener: onTouchStart');
        if (!this._firstTouch) {
            this.onFirstTouch();
        }
        if (GameManager.instance.state == EGameState.WIN || GameManager.instance.state == EGameState.LOSE) {
            PlayableAdsManager.instance.OpenStore();
        }
    }

    public onFirstTouch(): void {
        this._firstTouch = true;
        GameManager.instance.state = EGameState.PLAYING;
        GameManager.instance.nodeTapToPlay.active = false;
        TrackingManager.FirstClick();
        AudioManager.instance.PlayBackground();
    }
}


