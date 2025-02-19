import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';
import { EGameState } from '../../../Core/EGameState';
const { ccclass, property } = _decorator;

@ccclass("GameInitialization")
export class GameInitialization extends GameState {
    
    public enterState(): void {
        let self = this._gameManager;
        self.levelLoader.initialize(self.currentLevel);
        self.State = EGameState.READY;
    }

    public updateState(dt: number): void {

    }

    private initLevel(): Promise<void> {
        return new Promise((resolve, reject) => {
            let self = this._gameManager;
            
        });
    }
}
