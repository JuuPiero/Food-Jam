import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
const { ccclass, property } = _decorator;

@ccclass("GameWin")
export class GameWin extends GameState {
    
    public enterState(): void {
    }

    public updateState(dt: number): void {
    }
}
