import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
const { ccclass, property } = _decorator;

@ccclass("GameWin")
export class GameWin extends GameState {
    
    public enterState(): void {
        console.log('GameWin');
        this._gameManager.scheduleOnce(() => {
            this._gameManager.screenWin.forEach(screen => {
                screen.show();
            });
        }, 2);
    }

    public updateState(dt: number): void {
    }
}
