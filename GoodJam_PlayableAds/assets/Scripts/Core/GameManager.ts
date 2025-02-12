import { _decorator, Animation, CCInteger, Component, easing, JsonAsset, Node, tween, Vec3 } from 'cc';
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
import { State } from '../Base/State/State';
import { GameState } from '../Base/State/GameState/GameState';
import { GameInitialization } from '../Base/State/GameState/GameInitialization';
import { GameReady } from '../Base/State/GameState/GameReady';
import { GamePlaying } from '../Base/State/GameState/GamePlaying';
import { GameWin } from '../Base/State/GameState/GameWin';
import { GameLose } from '../Base/State/GameState/GameLose';
import { GameEnd } from '../Base/State/GameState/GameEnd';
const { ccclass, property } = _decorator;


@ccclass('GameManager')
export class GameManager extends State<EGameState, GameState> {

    @property(BoxController) // box
    boxController: BoxController = null;

    @property(SlotController) // slot
    slotController: SlotController = null;
    
    @property(Node)
    nodeTopLayer: Node = null;

    @property(MapLoader)
    mapLoader: MapLoader = null;

    public currentLevel: number = 0;
    private static _instance: GameManager;
    public static get Instance(): GameManager {
        return this._instance;
    }

    protected start(): void {
        GameManager._instance = this;
        this.State = EGameState.INITIALIZATION;
    }

    protected changeState(state: EGameState): void {
        switch (state) {
            case EGameState.INITIALIZATION:
                this._stateIntance = new GameInitialization(this);
                break;
            case EGameState.READY:
                this._stateIntance = new GameReady(this);
                (this);
                break;
            case EGameState.PLAYING:
                this._stateIntance = new GamePlaying(this);
                break;
            case EGameState.WIN:
                this._stateIntance = new GameWin(this);
                break;
            case EGameState.LOSE:
                this._stateIntance = new GameLose(this);
                break;
            case EGameState.END:
                this._stateIntance = new GameEnd(this);
                break;
        }
        this._stateIntance?.enterState();
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
        if (this.objPickedUp >= 1000) {
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
                }, 500);
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
            let startPos: Vec3 = matchObj.node.getWorldPosition();
            let scale: Vec3 = matchObj.node.getWorldScale();
            matchObj.node.parent = this.nodeTopLayer;
            matchObj.node.setWorldPosition(startPos);
            matchObj.node.setWorldScale(scale);

            tween(matchObj.node)
                .to(0.5, {
                    worldPosition: this.boxController.Boxes[id].node.worldPosition,
                    scale: new Vec3(0.5, 0.5, 0.5)
                }, { easing: easing.cubicInOut })
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
            let startPos: Vec3 = matchObj.node.getWorldPosition();
            let scale: Vec3 = matchObj.node.getWorldScale();
            matchObj.node.parent = this.nodeTopLayer;
            matchObj.node.setWorldPosition(startPos);
            matchObj.node.setWorldScale(scale);

            tween(matchObj.node)
                .to(0.5, {
                    worldPosition: this.slotController.Slots[id].worldPosition,
                    scale: new Vec3(0.5, 0.5, 0.5)
                }, { easing: easing.cubicInOut })
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


