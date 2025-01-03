import { _decorator, Animation, CCInteger, Component, Node, tween, Vec3 } from 'cc';
import { MatchObj } from './MatchObj';
import { SlotController } from './SlotController';
import { BoxController } from './BoxController';
import { IntroBase } from '../Animation/IntroBase';
import { EGameState } from './EGameState';
import { TouchEventListener } from './TouchEventListener';
import { TrackingManager } from '../../base-script/PlayableAds/Tracking/TrackingManager';
import { PlayableAdsManager } from '../../base-script/PlayableAds/PlayableAdsManager';
import { AudioManager, AudioType } from '../AudioManager';
import { MapLoader } from './MapLoader';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager;

    @property({ type: BoxController, group: "Import" }) // box
    private boxController: BoxController;
    @property({ type: SlotController, group: "Import" }) // slot
    private slotController: SlotController;
    @property({ type: IntroBase, group: "Import" })
    private intro: IntroBase;
    
    @property({ type: Node, group: "Popup" })
    private popup_win: Node;
    @property({ type: Node, group: "Popup" })
    private popup_lose: Node;

    private isBusy: boolean;
    private gameStart: boolean;

    @property({ type: CCInteger })
    private overridePickupWin: number = -1; // (-1) -> pickup all to win
    @property(Animation)
    animTutorial: Animation = null;

    @property(Node)
    nodeTapToPlay: Node = null;
    
    private objPickedUp: number;
    private count: number = 0;

    public state: EGameState = EGameState.NONE;

    protected start(): void {
        GameManager.instance = this;
        this.intro.StartAnim();
    }

    // region Start
    public StartGame() {
        this.gameStart = true;
        this.isBusy = false;
        this.objPickedUp = 0;
        this.intro.Play();
    }

    // region Pickup MatchObj
    public PickUpMatchObj(matchObj: MatchObj) {
        if (!this.gameStart || this.isBusy) return;
        if (this.objPickedUp >= 30) {
            PlayableAdsManager.instance.ForceOpenStore();
            return;
        }
        if (!TouchEventListener.instance.checkFirstClicked()) {
            this.state = EGameState.PLAYING;
            TouchEventListener.instance.onFirstTouch();
        }
        MapLoader.instance.nodeTutorial.active = false;
        // move object to box if possible
        if (!this.MoveToBoxIfFit(matchObj)) {
            // if can't move to box -> move to empty slot
            if (this.MoveToSlotIfFit(matchObj)) {
                this.objPickedUp++;
                matchObj.RemoveFromShelf();
                // wait before check full
                setTimeout(() => {
                    if (this.slotController.IsFull()) this.FullSlot();
                }, 400);
            }
            return;
        }
        this.objPickedUp++;
        matchObj.RemoveFromShelf();
    }
    public MoveToBoxIfFit(matchObj: MatchObj): boolean {
        var id = this.boxController.CheckContainId(matchObj.objId);
        if (id != -1) {
            this.isBusy = true;
            tween(matchObj.node)
                .to(0.25, {
                    worldPosition: this.boxController.Boxes[id].node.worldPosition,
                    scale: new Vec3(0.5, 0.5, 0.5)
                }, { easing: 'sineIn' })
                .call(() => {
                    matchObj.node.active = false;
                    this.isBusy = false;
                    if (this.objPickedUp === BoxController.maxObj)
                        this.Win();
                })
                .delay(0.1)
                .call(() => { this.slotController.CheckMoveSlotToBox(); })
                .start();
            return true;
        }
        return false;
    }
    private MoveToSlotIfFit(matchObj: MatchObj): boolean {
        var id = this.slotController.PreMoveToEmptySlot(matchObj);
        if (id != -1) {
            this.isBusy = true;
            tween(matchObj.node)
                .to(0.25, {
                    worldPosition: this.slotController.Slots[id].worldPosition,
                    scale: new Vec3(1, 1, 1)
                }, { easing: 'sineIn' })
                .call(() => {
                    matchObj.node.setParent(this.slotController.node, true);
                    this.slotController.SortObjInSlot();
                    this.isBusy = false;
                })
                .start();
            return true;
        }
        return false;
    }

    // region Win/Lose
    public FullSlot() {
        AudioManager.instance.StopBackground();
        AudioManager.instance.PlayAudio(AudioType.Lose);
        TrackingManager.LoseLevel();
        this.state = EGameState.LOSE;
        this.gameStart = false;
        this.popup_lose.active = true;
    }
    public Win() {
        AudioManager.instance.StopBackground();
        AudioManager.instance.PlayAudio(AudioType.Win);
        TrackingManager.WinLevel();
        this.state = EGameState.WIN;
        this.gameStart = false;
        this.popup_win.active = true;
    }

    public playNow(): void {
        TrackingManager.ClickConversion();
        PlayableAdsManager.instance.OpenStore();
    }
}


