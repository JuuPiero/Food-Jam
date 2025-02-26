import { _decorator, Component, easing, tween, UIOpacity } from 'cc';
import { FreeSlot } from './FreeSlot';
const { ccclass, property } = _decorator;

@ccclass('SlotManager')
export class SlotManager extends Component {
    
    @property([FreeSlot])
    freeSlots: FreeSlot[] = [];

    @property([UIOpacity])
    uiWarning: UIOpacity[] = [];

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
        this.flashesWarning();
    }

    private flashesWarning(): void {
        this.uiWarning.forEach(uiOpacity => {
            if (uiOpacity.node.activeInHierarchy) {
                let duration = 0.25
                tween(uiOpacity).to(duration, {opacity: 255}, {easing: easing.cubicOut})
                    .to(duration, {opacity: 0}, {easing: easing.cubicOut})
                    .to(duration, {opacity: 255}, {easing: easing.cubicOut})
                    .to(duration, {opacity: 0}, {easing: easing.cubicOut})
                    .to(duration, {opacity: 255}, {easing: easing.cubicOut})
                    .to(duration, {opacity: 0}, {easing: easing.cubicOut})
                    .start();
            }
        });
    }
}


