import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { MatchObj } from './MatchObj';
import { SlotController } from './SlotController';
import { BoxController } from './BoxController';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager;

    @property({ type: BoxController }) // box
    private boxController: BoxController;
    @property({ type: SlotController }) // slot
    private slotController: SlotController;

    protected start(): void {
        GameManager.instance = this;
    }

    public PickUpMatchObj(matchObj: MatchObj) {
        // move object to box if possible
        if (!this.MoveToBoxIfFit(matchObj)) {
            // if can't move to box -> move to empty slot
            if (this.MoveToSlotIfFit(matchObj)) {
                matchObj.RemoveFromShelf();
                // wait before check full
                setTimeout(() => {
                    if (this.slotController.IsFull()) this.FullSlot();
                }, 400);
            }
            return;
        }
        matchObj.RemoveFromShelf();
    }

    public MoveToBoxIfFit(matchObj: MatchObj): boolean {
        var id = this.boxController.CheckContainId(matchObj.objId);
        if (id != -1) {
            tween(matchObj.node)
                .to(0.3, {
                    worldPosition: this.boxController.Boxes[id].node.worldPosition,
                    scale: new Vec3(0.5, 0.5, 0.5)
                }, { easing: 'sineIn' })
                .call(()=>{ 
                    this.slotController.CheckMoveSlotToBox(); 
                    matchObj.node.active = false;
                }).start();
            return true;
        }
        return false;
    }
    private MoveToSlotIfFit(matchObj: MatchObj): boolean {
        var id = this.slotController.PreMoveToEmptySlot(matchObj);
        if (id != -1) {
            tween(matchObj.node)
                .to(0.3, {
                    worldPosition: this.slotController.Slots[id].worldPosition,
                    scale: new Vec3(0.5, 0.5, 0.5)
                }, { easing: 'sineIn' })
                .start();
            return true;
        }
        return false;
    }
    public FullSlot() {
        console.log("Full Slot");
    }
}


