import { _decorator, Component, EffectAsset, Node } from 'cc';
import { ScreenBase } from './ScreenBase';
import { AudioManager, ESoundEffect } from '../AudioManager';
import { GameManager } from '../Core/GameManager';
const { ccclass, property } = _decorator;

@ccclass('WinScreen')
export class WinScreen extends ScreenBase {
    
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
}


