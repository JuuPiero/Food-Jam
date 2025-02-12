import { _decorator, Component, Node } from 'cc';


const { ccclass, property } = _decorator;

@ccclass('State')
export abstract class State<E, I> extends Component {
    
    //#endregion Properties
    protected _state: E = null;
    public set State(state: E) {
        this._state = state;
        this.changeState(this._state);
    }
    public get State(): E {
        return this._state;
    }

    protected _stateIntance: I = null;
    //#endregion

    //#region Abstract method
    protected abstract changeState(state: E): void;
    //#endregion
}


