import { _decorator, Component, Node, Tween, tween } from 'cc';
import { MatchObj } from './MatchObj';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('SlotController')
export class SlotController extends Component {
    @property({ type: [Node] })
    public Slots: Node[] = [];
    private ObjHolding: MatchObj[] = [];

    public CheckMoveSlotToBox() {
        for (let i = 0; i < this.ObjHolding.length; i++) {
            // if (this.ObjHolding[i] != null && GameManager.instance.MoveToBoxIfFit(this.ObjHolding[i])) {
            //     // Remove from list
            //     this.ObjHolding[i] = null;
            //     this.SortObjInSlot();
            // }
        }
    }
    public SortObjInSlot() {
        // Move so that obj holding to the start of array
        let insertPos = 0;
        Tween.stopAllByTag(1);
        for (let j = 0; j < this.ObjHolding.length; j++) {
            if (this.ObjHolding[j] !== null) {
                this.ObjHolding[insertPos] = this.ObjHolding[j];
                tween(this.ObjHolding[insertPos].node)
                    .tag(1)
                    .to(0.2, { worldPosition: this.Slots[insertPos].worldPosition }, { easing: 'sineIn' })
                    .start();
                insertPos++;
            }
        }

        // Fill the remaining positions with `null`
        for (let j = insertPos; j < this.ObjHolding.length; j++) {
            this.ObjHolding[j] = null;
        }
    }
    public PreMoveToEmptySlot(matchObj: MatchObj): number {
        for (let i = 0; i < this.Slots.length; i++) {
            if (this.ObjHolding[i] == null) {
                this.ObjHolding[i] = matchObj;
                return i;
            }
        }
        return -1;
    }
    public IsFull(): boolean {
        for (let i = 0; i < this.Slots.length; i++)
            if (this.ObjHolding[i] == null)
                return false;
        return true;
    }
}


