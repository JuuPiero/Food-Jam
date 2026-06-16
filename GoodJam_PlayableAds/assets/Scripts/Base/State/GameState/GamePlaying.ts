import { _decorator, Component, Node } from 'cc';
import { GameState } from './GameState';

const { ccclass, property } = _decorator;

@ccclass("GamePlaying")
export class GamePlaying extends GameState {
    
    public enterState(): void {
        let self = this._gameManager;
        self.homeScreen.forEach(screen => screen.hide());
        let levelLoader = self.levelLoader;
        levelLoader.schedule(levelLoader.hintGoodsBySmoke, 8);
    }

    public updateState(dt: number): void {
        let self = this._gameManager;
        let levelLoader = self.levelLoader;
        levelLoader.unschedule(levelLoader.hintGoodsBySmoke);
    }
}
