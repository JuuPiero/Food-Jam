import { _decorator, Animation, CCInteger, Component, easing, JsonAsset, Node, tween, Vec3 } from 'cc';
import { EGameState } from './EGameState';
import { State } from '../Base/State/State';
import { GameState } from '../Base/State/GameState/GameState';
import { GameInitialization } from '../Base/State/GameState/GameInitialization';
import { GameReady } from '../Base/State/GameState/GameReady';
import { GamePlaying } from '../Base/State/GameState/GamePlaying';
import { GameWin } from '../Base/State/GameState/GameWin';
import { GameLose } from '../Base/State/GameState/GameLose';
import { GameEnd } from '../Base/State/GameState/GameEnd';
import { LevelLoader } from './LevelLoader';
import { ScreenBase } from '../Screen/ScreenBase';
const { ccclass, property } = _decorator;


@ccclass('GameManager')
export class GameManager extends State<EGameState, GameState> {

    @property(LevelLoader)
    levelLoader: LevelLoader = null;

    @property([ScreenBase])
    screenWin: ScreenBase[] = [];

    @property([ScreenBase])
    screenLose: ScreenBase[] = [];

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
}


