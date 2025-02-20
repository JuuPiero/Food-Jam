import { _decorator, Animation, Component, Node } from 'cc';
import { Slot } from './Slot';
import { Goods } from '../Goods/Goods';
import { AudioManager, ESoundEffect } from '../AudioManager';
const { ccclass, property } = _decorator;

export enum ESlotAnimation {
    DOWN = "SlotDown"
}

@ccclass('FreeSlot')
export class FreeSlot extends Slot {
    
    @property(Animation)
    animSlot: Animation = null;

    public add(goods: Goods): Promise<Goods> {
        return new Promise((resolve, reject) => {
            super.add(goods).then(() => {
                AudioManager.playEffect(ESoundEffect.DROP_SLOT);
                this.animSlot.play(ESlotAnimation.DOWN);
                resolve(goods);
            });
        });
    }
}


