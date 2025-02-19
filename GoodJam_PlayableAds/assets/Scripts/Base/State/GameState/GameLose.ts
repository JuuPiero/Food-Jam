import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
const { ccclass, property } = _decorator;

@ccclass("GameLose")
export class GameLose extends GameState {
    
    public enterState(): void {
        console.log('GameLose');
        this._gameManager.scheduleOnce(() => {
            this._gameManager.screenLose.forEach(screen => {
                screen.show();
            });
        }, 2);
    }

    public updateState(dt: number): void {
    }
}
