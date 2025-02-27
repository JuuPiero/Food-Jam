import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
import { GameManager } from '../../../Core/GameManager';
const { ccclass, property } = _decorator;

@ccclass("GamePlaying")
export class GamePlaying extends GameState {
    
    public enterState(): void {
        GameManager.Instance.homeScreen.forEach(screen => screen.hide());
    }

    public updateState(dt: number): void {
    }
}
