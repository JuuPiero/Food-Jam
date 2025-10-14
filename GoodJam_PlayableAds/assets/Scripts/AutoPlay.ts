import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node } from 'cc';
import { BoxManager } from './Core/BoxManager';
import { LevelLoader } from './Core/LevelLoader';
const { ccclass, property } = _decorator;

@ccclass('AutoPlay')
export class AutoPlay extends Component
{
    @property(BoxManager)
    boxManager: BoxManager = null;

    @property(LevelLoader)
    level: LevelLoader = null;

    protected start()
    {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: EventKeyboard)
    {
        switch (event.keyCode)
        {
            case KeyCode.SPACE:   
                this.autoPlay();
                break;
        }
    }

    private autoPlay(): void 
    {
        const items = this.boxManager.getAllNeededItems();
        const activeGoods = this.level.getActiveGoods();
        console.log("AutoPlay: Try to find item to box: ", items, activeGoods.map(g => g.getId()));
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const found = activeGoods.find(good => good.getId() === item);
            if (found) {
                found.onClick();
                return;
            }
        }
        const boxes = this.boxManager.getActiveBoxesByAscendingNeededItems();
        let items2 = boxes.filter(box => !box.isFull()).map(box => box.getId());
        console.log("AutoPlay: No item to box, try to find in queue: ", items2);
        if (items2.length <= 0) return;
        const inQueueGoods = this.level.getInQueueGoods()
            .filter(g => items2.includes(g.good.getId()))
            .sort((a, b) => a.stepToTop - b.stepToTop);
        console.log("AutoPlay: Found in queue: ", inQueueGoods);
        if (inQueueGoods.length > 0)
        {
            inQueueGoods[ 0 ].shelf?.selectRandomGood();
        }
    }

    protected onDestroy(): void
    {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
}


