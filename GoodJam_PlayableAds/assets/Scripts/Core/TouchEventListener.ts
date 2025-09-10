import { _decorator, Component, EventTouch, Input, input, Node, NodeEventType } from 'cc';
import { TrackingManager } from '../../base-script/PlayableAds/Tracking/TrackingManager';
import { AudioManager } from '../AudioManager';
import { PlayableAdsManager } from '../../base-script/PlayableAds/PlayableAdsManager';
import { TutorialController } from './TutorialController';
import { LevelLoader } from './LevelLoader';
import { GameManager } from './GameManager';
import { EGameState } from './EGameState';
const { ccclass, property } = _decorator;

@ccclass('TouchEventListener')
export class TouchEventListener extends Component {
    
  
    private _firstTouch: boolean = false;
    private static _instance: TouchEventListener = null;
    public static get Instance(): TouchEventListener {
        return TouchEventListener._instance;
    }

    protected onLoad(): void {
        TouchEventListener._instance = this;
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

    public onTouchGoods(): void {
        this.onTouchStart(null);
    }

    private onTouchStart(event: EventTouch): void {
        console.log('TouchEventListener: onTouchStart');
        GameManager.Instance.countdownTime = GameManager.Instance.timeLimit;
        if (!this._firstTouch) {
            this.onFirstTouch();
        }
        // if (GameManager.instance.state == EGameState.WIN || GameManager.instance.state == EGameState.LOSE) {
        //     PlayableAdsManager.instance.OpenStore();
        // }
    }

    public onFirstTouch(): void {
        this._firstTouch = true;
        AudioManager.mute = false;
        // GameManager.Instance.startCounting();
        if(TutorialController.Instance.enableTut)
        {
            TutorialController.Instance.OffTut();
            LevelLoader.Instance.tutNode.active = false;
        }
       
        GameManager.Instance.State = EGameState.PLAYING;
        // GameManager.instance.nodeTapToPlay.active = false;
        TrackingManager.firstClick();
        AudioManager.playBackground();
    }

    private forceToStore(): void {
        let currentState = GameManager.Instance.State;
        if (currentState === EGameState.PLAYING) {
            PlayableAdsManager.Instance.forceOpenStore();
        }
    }
}


