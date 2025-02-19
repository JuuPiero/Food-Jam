import { _decorator, Component, Node } from 'cc';
import { IEnterState, IExitState } from '../../../Base/State/IState';
import { Layer } from '../Layer';


export abstract class LayerState implements IEnterState, IExitState {
    
    public constructor(layer: Layer) {
        this._layer = layer;
    }

    protected _layer: Layer = null;
    
    public abstract enterState(): void;
    public abstract exitState(): void;
}


