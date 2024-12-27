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
    private isBusy: boolean;

    protected start(): void {
        GameManager.instance = this;
    }

    public StartGame(){

    }
    
    public PickUpMatchObj(matchObj: MatchObj) {
        if (this.isBusy) return;

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
            this.isBusy = true;
            tween(matchObj.node)
                .to(0.25, {
                    worldPosition: this.boxController.Boxes[id].node.worldPosition,
                    scale: new Vec3(0.5, 0.5, 0.5)
                }, { easing: 'sineIn' })
                .call(()=>{ 
                    matchObj.node.active = false;
                    this.isBusy = false;
                })
                .delay(0.1)
                .call(()=>{this.slotController.CheckMoveSlotToBox();})
                .start();
            return true;
        }
        return false;
    }
    private MoveToSlotIfFit(matchObj: MatchObj): boolean {
        var id = this.slotController.PreMoveToEmptySlot(matchObj);
        if (id != -1) {
            this.isBusy = true;
            tween(matchObj.node)
                .to(0.25, {
                    worldPosition: this.slotController.Slots[id].worldPosition,
                    scale: new Vec3(0.5, 0.5, 0.5)
                }, { easing: 'sineIn' })
                .call(()=>{
                    matchObj.node.setParent(this.slotController.node, true);
                    this.slotController.SortObjInSlot();
                    this.isBusy = false;
                })
                .start();
            return true;
        }
        return false;
    }
    public FullSlot() {
        console.log("Full Slot");
    }
}


