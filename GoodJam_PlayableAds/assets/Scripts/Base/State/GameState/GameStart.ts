import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
const { ccclass, property } = _decorator;

@ccclass("GameStart")
export class GameStart extends GameState {
    
    public enterState(): void {
    }

    public updateState(dt: number): void {
    }
}
