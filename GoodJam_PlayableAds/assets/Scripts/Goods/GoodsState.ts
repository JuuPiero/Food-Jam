import { IEnterState, IExitState } from "../Base/State/IState";
import { Goods } from "./Goods";


export abstract class GoodsState implements IEnterState, IExitState {
    
    public constructor(goods: Goods) {
        this._goods = goods;
    }

    protected _goods: Goods = null;

    public abstract enterState(): void;
    public abstract exitState(): void;

}


