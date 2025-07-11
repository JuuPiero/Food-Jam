import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { GoodsBase } from '../Base/GoodsBase';
import { CollectCoin } from '../CollectCoin';
import { AudioManager, ESoundEffect } from '../AudioManager';
import { EGoodsState } from './Goods';
import { GameManager } from '../Core/GameManager';
import { EGameState } from '../Core/EGameState';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends GoodsBase {
    
    public initialize(id: number, spriteFrame: SpriteFrame): void {
        this._goodsId = id;
    }

    public onClick(): void {
        CollectCoin.Instance.collect(this).then(completed => {
            if (completed) {
                GameManager.Instance.State = EGameState.WIN;
            }
        });
        this.pickUp();
    }

    public reset(): void {

    }

    public pickUp(): void {
        AudioManager.playEffect(ESoundEffect.PICKUP);
        // Xử lý shelf
        this.shelf.onGoodsPickUp(this);
    }


    protected changeState(state: EGoodsState): void {
        this._stateIntance?.exitState();
        // switch (state) {
        //     case EGoodsState.ACTIVE:
        //         this._stateIntance = new GoodsActiveState(this);
        //         break;
        // }
    }
}


