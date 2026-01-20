import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
import { GameManager } from '../../../Core/GameManager';
import { PlayableAdsManager } from 'db://assets/base-script/PlayableAds/PlayableAdsManager';
import { EventType, TrackingManager } from 'db://assets/base-script/PlayableAds/Tracking/TrackingManager';
const { ccclass, property } = _decorator;

@ccclass("GameWin")
export class GameWin extends GameState {
    
    public enterState(): void {

        console.log('GameWin');
        let self = GameManager.Instance;
        
        GameManager.Instance.autoShowStore.active = true;
        TrackingManager.TrackEvent(EventType.CHALLENGE_SOLVED);
        TrackingManager.TrackEvent(EventType.COMPLETED);
        
        this._gameManager.scheduleOnce(() => {
            TrackingManager.TrackEvent(EventType.ENDCARD_SHOWN);
            this._gameManager.screenWin.forEach(screen => {
                screen.showWithEffect();
            });
            self.scheduleOnce(self.forceOpenStore, 3);
        }, 2);
    }

    public updateState(dt: number): void {
    }
}
