import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
import { EGameState } from '../../../Core/EGameState';
import { EventType, TrackingManager } from 'db://assets/base-script/PlayableAds/Tracking/TrackingManager';
const { ccclass, property } = _decorator;

@ccclass("GameStart")
export class GameStart extends GameState {
    
    public enterState(): void {
        let self = this._gameManager;
        TrackingManager.TrackEvent(EventType.CHALLENGE_STARTED);
        self.State = EGameState.PLAYING;
    }

    public updateState(dt: number): void {
    }
}
