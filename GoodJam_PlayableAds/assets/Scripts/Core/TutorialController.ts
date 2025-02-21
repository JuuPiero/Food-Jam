import { _decorator, CCInteger, Component, Node, tween, Vec3 } from 'cc';
import { LevelLoader } from './LevelLoader';
import { BoxManager } from './BoxManager';
import { Box } from '../Box/Box';
import { BoxSlot } from '../Slot/BoxSlot';
import { Shelf } from '../Shelf/Shelf';
import { BezierTween } from '../Modules/BezierTween';

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


