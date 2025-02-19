import { _decorator, Component, Node } from 'cc';
import { State } from '../../Base/State/State';
import { LayerState } from './LayerState/LayerState';
import { ActiveLayer } from './LayerState/ActiveLayer';
import { InactiveLayer } from './LayerState/InactiveLayer';
import { HiddenLayer } from './LayerState/HiddenLayer';
const { ccclass, property } = _decorator;

export enum ELayerState {
    ACTIVE,
    INACTIVE,
    HIDDEN
}

@ccclass('Layer')
export class Layer extends State<ELayerState, LayerState> {
    
    
    protected changeState(state: ELayerState): void {
        this._stateIntance?.exitState();
        switch (state) {
            case ELayerState.ACTIVE:
                this._stateIntance = new ActiveLayer(this);
                break;
            case ELayerState.INACTIVE:
                this._stateIntance = new InactiveLayer(this);
                break;
            case ELayerState.HIDDEN:
                this._stateIntance = new HiddenLayer(this);
                break;
        }
        this._stateIntance?.enterState();
    }
}


