import { GameManager } from "../../../Core/GameManager";
import { IEnterState, IUpdateState } from "../IState";


export abstract class GameState implements IEnterState, IUpdateState {
    
    protected _gameManager: GameManager = null;

    constructor(gameManager: GameManager) {
        this._gameManager = gameManager;
    }

    public abstract enterState(): void;
    public updateState(dt: number): void {}
}