import { _decorator, Component, Node, Sprite } from 'cc';
import { Slot } from './Slot';

const { ccclass, property } = _decorator;

@ccclass('BoxSlot')
export class BoxSlot extends Slot {
    
    @property(Sprite)
    sptHiddenGoods: Sprite = null;

    public setHiddenGoods(id: number): void {
        this._goodsId = id;
        let sfrGoods = this.levelLoader.goodsFactory.getSpriteFrameByID(id);
        this.sptHiddenGoods.spriteFrame = sfrGoods;
    }
}


