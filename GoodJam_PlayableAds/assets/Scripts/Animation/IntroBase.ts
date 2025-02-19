import { _decorator, Component, Node } from 'cc';
import { BoxController } from '../Core/BoxController';
import { SlotController } from '../Core/SlotController';
const { ccclass, property } = _decorator;

@ccclass('IntroBase')
export class IntroBase extends Component {
    @property({ type: BoxController, group: "Import" }) // box
    protected boxController: BoxController;
    @property({ type: SlotController, group: "Import" }) // slot
    protected slotController: SlotController;
    
    public StartAnim() { }
    public Play() { }
}


