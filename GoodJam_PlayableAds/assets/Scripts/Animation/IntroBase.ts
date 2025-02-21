import { _decorator, Component, Node } from 'cc';
import { SlotController } from '../Core/SlotController';
const { ccclass, property } = _decorator;

@ccclass('IntroBase')
export class IntroBase extends Component {
    @property({ type: SlotController, group: "Import" }) // slot
    protected slotController: SlotController;
    
    public StartAnim() { }
    public Play() { }
}


