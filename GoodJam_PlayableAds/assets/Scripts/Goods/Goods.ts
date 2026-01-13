import { _decorator, Animation, Button, CCInteger, Color, Component, Node, sp, Sprite, SpriteFrame, sys, tween, Vec3 } from 'cc';
import { GoodsBase } from '../Base/GoodsBase';
import { State } from '../Base/State/State';
import { GoodsState } from './GoodsState';
import { GoodsHiddenState } from './GoodsHiddenState';
import { GoodsInteractiveState } from './GoodsInteractiveState';
import { GoodsActiveState } from './GoodsActiveState';
import { GoodsBlockState } from './GoodsBlockState';
import { Shelf } from '../Shelf/Shelf';
import { GameManager } from '../Core/GameManager';
import { EGameState } from '../Core/EGameState';
import { TouchEventListener } from '../Core/TouchEventListener';
import { AudioManager, ESoundEffect } from '../AudioManager';
import { PlayableAdsManager } from '../../base-script/PlayableAds/PlayableAdsManager';
import { LevelLoader } from '../Core/LevelLoader';
import { DifficultCurve } from '../Core/DifficultCurve';

const { ccclass, property } = _decorator;

export enum EGoodsState {
    HIDDEN,
    INTERACTIVE,
    ACTIVE,
    BLOCK,
    PICKED
}

@ccclass('Goods')
export class Goods extends GoodsBase {

    @property(Sprite)
    sptGoods: Sprite = null;

    @property(Animation)
    animGoods: Animation = null;
    
    @property()
    public get goodPoint(): number
    {
        return this.referencedGoods.length;
    }

    @property([GoodsBase])
    public referencedGoods: GoodsBase[] = [];
    
    @property(sp.Skeleton)
    skeletonSmoke: sp.Skeleton = null;

    public shelf: Shelf = null;
    protected _goodsId: number = -1;

    private static _step: number = 0;

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
                // GameManager.Instance.moveLimit--;
                // if(GameManager.Instance.moveLimit<=0)
                // {
                //     GameManager.Instance.autoShowStore.active = true;
                // }
                Goods._step++;
                if (Goods._step === 40) {
                    GameManager.Instance.stopCouting();
                    PlayableAdsManager.Instance.forceOpenStore();
                }
                let locks = LevelLoader.Instance.locks;
                if (locks.length > 0) {
                    let lock = locks[0];
                    lock.sub(1).then(hp => {
                        if (hp === 0) {
                            locks.shift();
                        }
                    });
                }
                this.pickUp();
            }   
        }
    }

    public TutAnim()
    {
        // let boxManager = BoxManager.Instance;
        // boxManager.pickUpTut(this);
    }
    
    public pickUp(): void {
        this.changeState(EGoodsState.PICKED);
        if (sys.isBrowser && typeof navigator.vibrate === 'function') {
            navigator.vibrate(200);
        }
        AudioManager.playEffect(ESoundEffect.PICKUP);
        this.shelf?.boxManager?.levelLoader?.onItemPicked();
        this.shelf?.removeGoodsReference(this);

        //tính lại color points + update diffPoint theo progress item picked
        DifficultCurve.instance.calculateAndStore();
        DifficultCurve.instance.CalculateTargetPoint();
        DifficultCurve.instance.debugShow();
        
        // Xử lý shelf
        this.shelf.onGoodsPickUp(this);
        // Xử lý box
        let boxManager = this.shelf.boxManager;
        boxManager.pickUp(this);
    }

    //#region setReferencedGoods
    public setReferencedGoods(referencedGoods: GoodsBase[]): void
    {
        this.referencedGoods = (referencedGoods || []).filter(good => !!good);
    }
    //#endregion

    //#region removeReference
    public removeReference(target: GoodsBase): void
    {
        if (!target) return;
        const index = this.referencedGoods.indexOf(target);
        if (index !== -1)
        {
            this.referencedGoods.splice(index, 1);
        }
    }
    //#endregion

    //#region getReferencedGoods
    public getReferencedGoods(): GoodsBase[]
    {
        return this.referencedGoods;
    }
    //#endregion

    // Method play anim khói
    public playSmokeAnim(): void {
        AudioManager.playEffect(ESoundEffect.MEAT);
        this.skeletonSmoke.node.active = true;
        this.skeletonSmoke.setCompleteListener(track => {
            if (track.animation.name === "Smoke_01") {
                this.skeletonSmoke.node.active = false;
            }
        });
        this.skeletonSmoke.setAnimation(0, "Smoke_01", false);
    }

}