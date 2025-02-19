import { _decorator, Component, Node } from 'cc';
import { FreeSlot } from './FreeSlot';
const { ccclass, property } = _decorator;

@ccclass('SlotManager')
export class SlotManager extends Component {
    
    @property([FreeSlot])
    freeSlots: FreeSlot[] = [];

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
}


