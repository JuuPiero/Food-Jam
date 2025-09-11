import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
import { TrackingManager } from 'db://assets/base-script/PlayableAds/Tracking/TrackingManager';
import { GameManager } from '../../../Core/GameManager';
import { PlayableAdsManager } from 'db://assets/base-script/PlayableAds/PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass("GameLose")
export class GameLose extends GameState {
    
    public enterState(): void {
        let self = GameManager.Instance;
        self.scheduleOnce(self.forceOpenStore, 3);
        GameManager.Instance.autoShowStore.active = true;
        console.log('GameLose');
        TrackingManager.loseLevel();
        this._gameManager.scheduleOnce(() => {
            this._gameManager.screenLose.forEach(screen => {
                screen.showWithEffect();
            });
        }, 2);
    }

    public updateState(dt: number): void {
    }
}
