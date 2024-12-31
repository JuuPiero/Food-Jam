import { _decorator, Component, Node } from 'cc';
import { TrackingManager } from '../PlayableAds/Tracking/TrackingManager';
const { ccclass, property } = _decorator;

@ccclass('LosePage')
export class LosePage extends Component {
    protected onEnable(): void {
        TrackingManager.LoseLevel();
    }
}


