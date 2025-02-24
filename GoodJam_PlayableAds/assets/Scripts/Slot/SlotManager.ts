import { _decorator, Component, Node } from 'cc';
import { FreeSlot } from './FreeSlot';
const { ccclass, property } = _decorator;

@ccclass('SlotManager')
export class SlotManager extends Component {
    
    @property([FreeSlot])
    freeSlots: FreeSlot[] = [];

    protected onLoad(): void {
        this.freeSlots.forEach(slot => {
            slot.slotManager = this;
        });
    }
    public reset(): void {
        this.freeSlots.forEach(slot => {
            if (slot)
                slot.reset();
        });
    }

    public getFreeSlot(): FreeSlot {
        return this.freeSlots.find(slot => !slot.isFull());
    }

    public fullSlot(): boolean {
        return this.freeSlots.every(slot => slot.isFull());
    }

    public checkWarning(): boolean {
        // Nếu 4/5 slot đã đầy thì trả về true
        let count = 0;
        this.freeSlots.forEach(slot => {
            if (slot.isFull()) {
                count++;
            }
        });
        return count >= 4;
    }

    public showWarning(): void {
        this.freeSlots.forEach(slot => {
            if (!slot.isFull()) {
                slot.warning();
            }
        });
    }
}


