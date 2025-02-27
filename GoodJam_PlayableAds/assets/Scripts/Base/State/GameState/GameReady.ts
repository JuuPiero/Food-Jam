import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
import { GameManager } from '../../../Core/GameManager';
const { ccclass, property } = _decorator;

@ccclass("GameReady")
export class GameReady extends GameState {
    
    public enterState(): void {
        GameManager.Instance.homeScreen.forEach(screen => screen.show());
    }

    public updateState(dt: number): void {
    }
}
