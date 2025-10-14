import { _decorator, Animation, Component, Node, tween, UIOpacity } from 'cc';
import { Slot } from './Slot';
import { AudioManager, ESoundEffect } from '../AudioManager';
import { SlotManager } from './SlotManager';
import { GoodsBase } from '../Base/GoodsBase';
import { Goods } from '../Goods/Goods';
const { ccclass, property } = _decorator;

export enum ESlotAnimation {
    DOWN = "SlotDown"
}

@ccclass('FreeSlot')
export class FreeSlot extends Slot {
    
    @property(Animation)
    animSlot: Animation = null;

    @property(UIOpacity)
    uiOpacity: UIOpacity = null;

    public slotManager: SlotManager  = null;

    public add(goods: GoodsBase): Promise<Goods> {
        return new Promise((resolve, reject) => {
            super.add(goods).then(() => {
                AudioManager.playEffect(ESoundEffect.DROP_SLOT);
                this.animSlot.play(ESlotAnimation.DOWN);

                resolve(goods as Goods);
            });
        });
    }

    public warning(): void
    {
        return;
        tween(this.uiOpacity)
            .call(() => {
                AudioManager.playEffect(ESoundEffect.WARNING)
            })
            .to(0.25, {opacity: 255}, {easing: "cubicOut"})
            .to(0.25, {opacity: 0}, {easing: "cubicIn"})
            .call(() => {
                AudioManager.playEffect(ESoundEffect.WARNING)
            })
            .to(0.25, {opacity: 255}, {easing: "cubicOut"})
            .to(0.25, {opacity: 0}, {easing: "cubicIn"})
            .call(() => {
                AudioManager.playEffect(ESoundEffect.WARNING)
            })
            .to(0.25, {opacity: 255}, {easing: "cubicOut"})
            .to(0.25, {opacity: 0}, {easing: "cubicIn"})
            .start();
    }
}


