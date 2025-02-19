import { _decorator, Component, Node } from 'cc';
import { IScreenWithoutEffect, ISrceenWithEffect } from '../Base/Interfaces/IScreen';
const { ccclass, property } = _decorator;

@ccclass('ScreenBase')
export class ScreenBase extends Component implements ISrceenWithEffect, IScreenWithoutEffect {
    
    @property(Node)
    nodeStages: Node[] = [];

    public show(): Promise<void> {
        return new Promise((resolve) => {
            this.node.active = true;
            resolve();
        });
    }

    public hide(): Promise<void> {
        return new Promise((resolve) => {
            this.node.active = false;
            resolve();
        });
    }

    public showWithEffect(): Promise<void> {
        return new Promise((resolve) => {
            this.node.active = true;
            resolve();
        });
    }

    public hideWithEffect(): Promise<void> {
        return new Promise((resolve) => {
            this.node.active = false;
            resolve();
        });
    }
}


