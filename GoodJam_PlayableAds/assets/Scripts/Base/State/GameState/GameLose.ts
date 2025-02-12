import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
const { ccclass, property } = _decorator;

@ccclass("GameLose")
export class GameLose extends GameState {
    
    public enterState(): void {
    }

    public updateState(dt: number): void {
    }
}
