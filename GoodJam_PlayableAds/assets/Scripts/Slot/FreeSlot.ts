import { _decorator, Animation, Component, Node, tween, UIOpacity } from 'cc';
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

    @property(UIOpacity)
    uiOpacity: UIOpacity = null;

    public slotManager: SlotManager = null;

    public add(goods: Goods): Promise<Goods> {
        return new Promise((resolve, reject) => {
            super.add(goods).then(() => {
                AudioManager.playEffect(ESoundEffect.DROP_SLOT);
                this.animSlot.play(ESlotAnimation.DOWN);

                resolve(goods);
            });
        });
    }

    public warning(): void {
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


