import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
import { TrackingManager } from 'db://assets/base-script/PlayableAds/Tracking/TrackingManager';
import { GameManager } from '../../../Core/GameManager';
const { ccclass, property } = _decorator;

@ccclass("GameWin")
export class GameWin extends GameState {
    
    public enterState(): void {
        console.log('GameWin');
                GameManager.Instance.autoShowStore.active = true;
        
        TrackingManager.winLevel();
        this._gameManager.scheduleOnce(() => {
            this._gameManager.screenWin.forEach(screen => {
                screen.show();
            });
        }, 2);
    }

    public updateState(dt: number): void {
    }
}
