import { _decorator, Component, Node } from 'cc';
import { ScreenBase } from './ScreenBase';
const { ccclass, property } = _decorator;

@ccclass('LoseScreen')
export class LoseScreen extends ScreenBase {
    
    public show(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.nodeStages[0].active = true;
        });
    }
}


