import { _decorator, Component, Node } from 'cc';
import { BoxController } from '../Core/BoxController';
import { SlotController } from '../Core/SlotController';
import { MapLoader } from '../Core/MapLoader';
const { ccclass, property } = _decorator;

@ccclass('IntroBase')
export class IntroBase extends Component {
    @property({ type: BoxController, group: "Import" }) // box
    protected boxController: BoxController;
    @property({ type: SlotController, group: "Import" }) // slot
    protected slotController: SlotController;
    @property({ type: MapLoader, group: "Import" }) // shelf
    protected mapLoader: MapLoader;
    
    public StartAnim() { }
    public Play() { }
}


