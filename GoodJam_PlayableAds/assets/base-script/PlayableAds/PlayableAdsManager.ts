import { _decorator, Component, Enum, Game, game, Input, input } from 'cc';
import super_html_playable from './super_html_playable';
import { TrackingManager } from './Tracking/TrackingManager';
import { EventListener } from './EventListener';
import { GameEvent } from './GameEvent';
import { GameManager } from '../../Scripts/Core/GameManager';
import { KeyboardListener } from '../../Scripts/KeyboardListener';

const { ccclass, property } = _decorator;

@ccclass('PlayableAdsManager')
export class PlayableAdsManager extends Component {
    private urlPlayStore: string = "https://play.google.com/store/apps/details?id=com.ig.skewer.jam.food.sort";
    private urlAppStore: string = ""; 
    private static instanceId: string = "PlayableAdsManager";
    public playableAdsName: string = "iKame";

    private readonly titleDefault: string = "Cocos Creator - iKameSTPA_PlayableAds";

    private network: string = "";

    @property
    activeTracking: boolean = false;
    @property
    private logDebug: boolean = false;
    private touchedSpecific: boolean;
    private firstClicked: boolean = false;
    private runningGame: boolean = true;

    private static _instance: PlayableAdsManager = null;
    public static get Instance(): PlayableAdsManager {
        return this._instance;
    }

    protected onLoad(): void {
        PlayableAdsManager._instance = this;
        this.setLinkStore();

        // Gọi EventListener.emit(GameEvent.CLICK); vào hàm click của game 
        EventListener.on(GameEvent.CLICK, this.actionFirstClicked, this);

        const pageTitle = document.title;
        if(pageTitle == this.titleDefault) return;

        //Mở comment đoạn này để set lại biến titleDefault
        //console.log("Page Title: " + pageTitle);

        // Sau khi đã set lại biến titleDefault, mở comment đoạn này để lấy network

        // const paName = pageTitle.split("|")[1].trim();
        // this.network = window['super_html_channel'];
        // this.playableAdsName = paName +"_"+ this.network;

        // if(this.network == 'google'){
        //     this.activeTracking = false;
        // }
    }
    
    protected start(): void {
        TrackingManager.gameStart();
        game.on(Game.EVENT_RESUME, () => this.onGameResume());
        game.on(Game.EVENT_PAUSE, () => this.onGamePause());
        game.on(Game.EVENT_HIDE, () => this.onGameHide());
    }

    private onGameResume(): void {
        this.runningGame = true;
        if(this.logDebug){
            console.log("On Game Resume");
        }
    }

    private onGamePause(): void {
        this.runningGame = false;
        if(this.logDebug){
            console.log("On Game Pause");
        }
    }

    private onGameHide(): void {
        this.runningGame = false;
        if(this.logDebug){
            console.log("On Game Hide");
        }
    }

    private setLinkStore(): void {
        // Điều chỉnh lại link này theo từng dự án
        this.urlPlayStore = "https://ikameglobal.com/";
        this.urlAppStore = "https://ikameglobal.com/";
        super_html_playable.set_google_play_url(this.urlPlayStore);
        super_html_playable.set_app_store_url(this.urlAppStore);
        console.log("iKame Playstore :" + this.urlPlayStore)
        console.log("iKame AppStore:" + this.urlAppStore)
    }

    private actionFirstClicked(): void {
        if(!this.firstClicked){
            // TrackingManager.firstClick();
            this.firstClicked = true;

            // Bật background Music sau lần đầu play PA. Đây là Policy của web nên bắt buộc phải follow.
            //AudioManager.instance.playBackgroundMusic();
        }
    }

    private countTimeTracking: number = 3;
    private totalTimePlay: number = 0;

    protected update(dt: number): void {
        if(this.runningGame){
            this.totalTimePlay += dt;
            this.countTimeTracking -= dt;
            if(this.countTimeTracking <= 0){
                this.countTimeTracking = 3;
                TrackingManager.userEngagement(this.totalTimePlay);
            }
        }
    }

    // Dùng khi click vào button vào store
    public openStore(): void {
        if (KeyboardListener.isCreativeVersion) return;
        GameManager.Instance.unscheduleAllCallbacks();
        TrackingManager.clickConversion();
        super_html_playable.download();
        super_html_playable.game_end();
    }

    // Dùng khi không click mà đẩy thẳng vào store
    public forceOpenStore(): void {
        if (KeyboardListener.isCreativeVersion) return;
        TrackingManager.forceConversion();
        super_html_playable.download();
        super_html_playable.game_end();
    }

    public static logDebug(message: string): void {
        if(PlayableAdsManager.Instance.logDebug){
            console.log(message);
        }
    }
}
