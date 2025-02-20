import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TutorialController')
export class TutorialController extends Component {
    
    private static _instance: TutorialController = null;
    public static get Instance(): TutorialController {
        return TutorialController._instance;
    }


    @property(Node)
    tutHand: Node = null;

    public tutBool: boolean = false;

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


