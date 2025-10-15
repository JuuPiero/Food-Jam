import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node, Vec3, view } from 'cc';
import { BoxManager } from './Core/BoxManager';
import { LevelLoader } from './Core/LevelLoader';
import { CreativeDataRecord } from './CreativeDataRecord';
const { ccclass, property } = _decorator;

const CLICK_GOOD : string = "CLICK_GOOD"

@ccclass('AutoPlay')
export class AutoPlay extends Component
{
    @property(BoxManager)
    boxManager: BoxManager = null;

    @property(LevelLoader)
    level: LevelLoader = null;

    @property(CreativeDataRecord)
    recorder: CreativeDataRecord;

    @property(Node)
    canvasNode: Node;

    protected start()
    {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: EventKeyboard)
    {
        // switch (event.keyCode)
        // {
        //     case KeyCode.SPACE:   
        //         this.autoPlay();
        //         break;
        // }
    }

    private autoPlay(): void 
    {
        const items = this.boxManager.getAllNeededItems();
        const activeGoods = this.level.getActiveGoods();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const found = activeGoods.find(good => good.getId() === item);
            if (found) {
                found.onClick();
                this.recordClickData(found.node.getWorldPosition())
                return;
            }
        }
        const boxes = this.boxManager.getActiveBoxesByAscendingNeededItems();
        let items2 = boxes.filter(box => !box.isFull()).map(box => box.getId());
        if (items2.length <= 0) return;
        const inQueueGoods = this.level.getInQueueGoods()
            .filter(g => items2.includes(g.good.getId()))
            .sort((a, b) => a.stepToTop - b.stepToTop);
        if (inQueueGoods.length > 0)
        {
            const worldPos = inQueueGoods[ 0 ].shelf?.selectRandomGood();
            if (worldPos)
            {
                this.recordClickData(worldPos)
            }
        }
    }

    protected onDestroy(): void
    {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    public recordClickData(worldPos: Vec3)
    {
        const localPos = new Vec3();
        this.canvasNode.inverseTransformPoint(localPos, worldPos)
        const x = localPos.x + view.getDesignResolutionSize().width * 0.5;
        const y =  view.getDesignResolutionSize().height - ( localPos.y + view.getDesignResolutionSize().height * 0.5)
        this.recorder.AddData(CLICK_GOOD, x, y);
    }
}


