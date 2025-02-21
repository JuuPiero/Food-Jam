import { _decorator, Animation, Button, CCInteger, Color, Component, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { GoodsBase } from '../Base/GoodsBase';
import { State } from '../Base/State/State';
import { GoodsState } from './GoodsState';
import { GoodsHiddenState } from './GoodsHiddenState';
import { GoodsInteractiveState } from './GoodsInteractiveState';
import { ShelfLayer } from '../Shelf/Layer/ShelfLayer';
import { GoodsActiveState } from './GoodsActiveState';
import { GoodsBlockState } from './GoodsBlockState';
import { Shelf } from '../Shelf/Shelf';
import { GameManager } from '../Core/GameManager';
import { EGameState } from '../Core/EGameState';
import { TouchEventListener } from '../Core/TouchEventListener';
import { AudioManager, ESoundEffect } from '../AudioManager';
import { BoxManager } from '../Core/BoxManager';

const { ccclass, property } = _decorator;

export enum EGoodsState {
    HIDDEN,
    INTERACTIVE,
    ACTIVE,
    BLOCK
}

@ccclass('Goods')
export class Goods extends State<EGoodsState, GoodsState> implements GoodsBase {

    @property(Sprite)
    sptGoods: Sprite = null;

    @property(Animation)
    animGoods: Animation = null;
    
    public shelf: Shelf = null;
    protected _goodsId: number = -1;

    protected changeState(state: EGoodsState): void {
        this._stateIntance?.exitState();
        switch (state) {
            case EGoodsState.ACTIVE:
                this._stateIntance = new GoodsActiveState(this);
                break;
            case EGoodsState.HIDDEN:
                this._stateIntance = new GoodsHiddenState(this);
                break;
            case EGoodsState.INTERACTIVE:
                this._stateIntance = new GoodsInteractiveState(this);
                break;
            case EGoodsState.BLOCK:
                this._stateIntance = new GoodsBlockState(this);
                break;
            default:
                break;
        }
        this._stateIntance?.enterState();
    }

    public initialize(id: number, spriteFrame: SpriteFrame): void {
        this._goodsId = id;
        this.sptGoods.spriteFrame = spriteFrame;
    }

    public reset(): void {
        
    }

    public getId(): number {
        return this._goodsId;
    }

    public onClick(): void {
        let state = [EGameState.READY, EGameState.PLAYING];
        if (state.includes(GameManager.Instance.State)) {
            if (this.State === EGoodsState.ACTIVE) {
                TouchEventListener.Instance.onTouchGoods();
                this.pickUp();
            }   
        }
    }
    public TutAnim()
    {
        let boxManager = BoxManager.instance;
        boxManager.pickUpTut(this);
    }
    private pickUp(): void {
        AudioManager.playEffect(ESoundEffect.PICKUP);
        // Xử lý shelf
        this.shelf.onGoodsPickUp(this);
        // Xử lý box
        let boxManager = this.shelf.boxManager;
        boxManager.pickUp(this);
    }
}