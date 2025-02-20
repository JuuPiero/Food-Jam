import { _decorator, Component, Node } from 'cc';
import { Goods } from '../Goods/Goods';
const { ccclass, property } = _decorator;

@ccclass('TutorialController')
export class TutorialController extends Component {
    
    @property(Goods)
    targetItem: Goods = null;

    @property(Node)
    tutHand: Node = null;

    public tutBool: boolean = false;
    private static _instance: TutorialController = null;
    public static get Instance(): TutorialController {
        return TutorialController._instance;
    }

    protected onLoad(): void {
        TutorialController._instance = this;
    }

    OnTut()
    {
        this.tutHand.active = true;
        this.tutBool = true;
    }
    OffTut()
    {
        this.tutHand.active = false;
        this.tutBool = false;
    }
}


