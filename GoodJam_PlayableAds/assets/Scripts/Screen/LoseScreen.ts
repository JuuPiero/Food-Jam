import { _decorator, Component, instantiate, Node, Sprite, Widget } from 'cc';
import { ScreenBase } from './ScreenBase';
import { BoxManager } from '../Core/BoxManager';
import { SlotManager } from '../Slot/SlotManager';
import { Box } from '../Box/Box';
import { Slot } from '../Slot/Slot';
import { PromiseUtils } from '../PromiseUtils';
import { AudioManager, ESoundEffect } from '../AudioManager';
const { ccclass, property } = _decorator;

@ccclass('LoseScreen')
export class LoseScreen extends ScreenBase {
    
    @property([Node])
    nodeResults: Node[] = [];

    @property(Node)
    nodeParent: Node = null;
    
    private _nodeClones: Node[] = [];

    protected onEnable(): void {
        this.scheduleOnce(() => {
            if (this._nodeClones.length === 2) {
                this._nodeClones.forEach((node, index) => {
                    let worldPos = this.nodeResults[index].getWorldPosition();
                    let worldScale = this.nodeResults[index].getWorldScale();
                    node.setWorldPosition(worldPos);
                    node.setWorldScale(worldScale);
                });
            }
        }, 0);
    }

    public show(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            AudioManager.stopBackground();
            AudioManager.playEffect(ESoundEffect.TYPING);
            this.nodeStages[0].active = true;
            this.nodeParent.removeAllChildren();
            this.nodeResults.forEach(node => {
                AudioManager.playEffect(ESoundEffect.FAIL);
                let clone = this.clone(node, this.nodeParent);
                this._nodeClones.push(clone);
            }, 0.5);

            await PromiseUtils.delay(3.5);

            this.nodeStages[0].active = false;
            this.nodeStages[1].active = true;
            
        });
    }

    private clone(node: Node, parent: Node): Node {
        let clone = instantiate(node);
        // Remove component
        let boxManager = clone.getComponent(BoxManager);
        if (boxManager) {
            let boxes = boxManager.getComponentsInChildren(Box);
            boxes.forEach(box => box.destroy());
            boxManager.destroy();
        }
        let slotManager = clone.getComponent(SlotManager);
        if (slotManager) {
            let slots = slotManager.getComponentsInChildren(Slot);
            slots.forEach(slot => slot.destroy());
            slotManager.destroy();
        }

        let sprites = clone.getComponentsInChildren(Sprite);
        sprites.forEach(sprite => sprite.node.layer = 1 << 5);

        let widget = clone.getComponent(Widget);
        if (widget) {
            widget.enabled = false;
            widget.destroy();
        }
        // widget && widget.destroy();s
        let worldPos = node.getWorldPosition();
        let worldScale = node.getWorldScale();
        parent.addChild(clone);
        clone.setWorldPosition(worldPos);
        clone.setWorldScale(worldScale);
        return clone;
    }
}


