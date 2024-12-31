import { _decorator, Component, Node } from 'cc';
import { TrackingManager } from '../PlayableAds/Tracking/TrackingManager';
const { ccclass, property } = _decorator;

@ccclass('WinPage')
export class WinPage extends Component {
    protected onEnable(): void {
        TrackingManager.WinLevel();
    }
}


