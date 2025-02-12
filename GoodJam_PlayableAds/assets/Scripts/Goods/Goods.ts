import { _decorator, Button, CCInteger, Color, Component, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { GoodsBase } from '../Base/GoodsBase';
import { State } from '../Base/State/State';
import { GoodsState } from './GoodsState';
import { GoodsHiddenState } from './GoodsHiddenState';
import { GoodsInteractiveState } from './GoodsInteractiveState';
import { ShelfLayer } from '../Shelf/Layer/ShelfLayer';

const { ccclass, property } = _decorator;

export enum EGoodsState {
    HIDDEN,
    INTERACTIVE
}

@ccclass('Goods')
export class Goods extends State<EGoodsState, GoodsState> implements GoodsBase {

    @property(Sprite)
    sptGoods: Sprite = null;

    public shelfLayer: ShelfLayer = null;

    protected changeState(state: EGoodsState): void {
        this._stateIntance?.exitState();
        switch (state) {
            case EGoodsState.HIDDEN:
                this._stateIntance = new GoodsHiddenState(this);
                break;
            case EGoodsState.INTERACTIVE:
                this._stateIntance = new GoodsInteractiveState(this);
                break;
            default:
                break;
        }
        this._stateIntance?.enterState();
    }

    public initialize(id: number, spriteFrame: SpriteFrame): void {
        this.sptGoods.spriteFrame = spriteFrame;
    }

    public reset(): void {
        
    }

    public onClick(): void {
        this.shelfLayer.removeGoods(this);
    }
}