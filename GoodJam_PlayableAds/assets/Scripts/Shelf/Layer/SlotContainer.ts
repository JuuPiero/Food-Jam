import { _decorator, Component } from 'cc';
import { Shelf } from '../Shelf';
import { GoodsBase } from '../../Base/GoodsBase';
import { Slot } from '../../Slot/Slot';

const { ccclass, property } = _decorator;

@ccclass('SlotContainer')
export class SlotContainer extends Component {
    
    @property([Slot])
    slots: Slot[] = [];

    public shelf: Shelf = null;

    public set(goods: GoodsBase): void {
        // Tìm slot trống và set
        let slot = this.slots.find(slot => !slot.isFull());
        if (slot) {
            slot.set(goods);
        }
    }

    public add(goods: GoodsBase): Promise<void> {
        return new Promise((resolve, reject) => {
            
            for (let i = 0; i < this.slots.length; i++) {
                if (this.slots[i].isFull()) {
                    continue;
                }
                this.slots[i].add(goods).then(goods => {
                    resolve();
                });
                return;
            }
        });
    }

    public remove(goods: GoodsBase): GoodsBase {
        return this.slots.find(slot => slot.getGoods() === goods).remove();
    }
    
    public removeAll(): void {
        this.slots.forEach(slot => {
            slot.remove();
        });
    }

    public getAllGoods(): GoodsBase[] {
        let list = this.slots.map(slot => slot.getGoods());
        return list;
    }
}


