import { _decorator, Component, Node } from 'cc';
import { MatchObj } from './MatchObj';
import { MapLoader } from './MapLoader';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager;

    @property({ type: MapLoader })
    private mapLoader: MapLoader;

    protected start(): void {
        GameManager.instance = this;
    }

    public PickUpMatchObj(matchObj: MatchObj){
        matchObj.node.active = false;
    }
}


