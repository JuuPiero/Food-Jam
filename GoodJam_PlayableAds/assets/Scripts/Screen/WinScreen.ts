import { _decorator, Component, easing, EffectAsset, Node, tween, UIOpacity } from 'cc';
import { ScreenBase } from './ScreenBase';
import { AudioManager, ESoundEffect } from '../AudioManager';
import { GameManager } from '../Core/GameManager';
const { ccclass, property } = _decorator;

@ccclass('WinScreen')
export class WinScreen extends ScreenBase {
    
    @property([UIOpacity])
    uiOpacities: UIOpacity[] = [];

    public show(): Promise<void> {
        return new Promise((resolve, reject) => {
            GameManager.Instance.autoShowStore.active = true;
            AudioManager.stopBackground();
            this.nodeStages[0].active = true;
            AudioManager.playEffect(ESoundEffect.WIN);
            this.scheduleOnce(() => {
                // AudioManager.playEffect(ESoundEffect.CONFETTI);
            }, 1);
        });
    }

    public showWithEffect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.uiOpacities.forEach(uiOpacity => {
                tween(uiOpacity).to(0.3, {opacity: 255}, {easing: easing.cubicOut}).start();
                resolve();
            });
        });
    }
}


