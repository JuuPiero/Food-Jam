import { _decorator, Button, CCInteger, Color, Component, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { Shelf } from './Shelf';
import { AudioManager, AudioType } from '../AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MatchObj')
export class MatchObj extends Component {
    @property({ type: Sprite })
    private sprite: Sprite;
    @property({ type: Button })
    button: Button;

    private static rowDisplacement: number = 7;
    private static maxRowSee: number = 3;
    private shelf: Shelf;

    public objId: number;
    private row: number; // row for shelfData
    private curRow: number; // current item in what row
    private col: number;

    public Init(shelf: Shelf, row: number, col: number, objId: number, sprite: SpriteFrame) {
        this.shelf = shelf;
        this.row = row;
        this.curRow = row;
        this.col = col;
        this.objId = objId;
        this.sprite.spriteFrame = sprite;
        this.UpdatePositionAndColor(false);
    }

    public MoveUp() {
        this.curRow--;
        this.UpdatePositionAndColor(true);
    }

    private UpdatePositionAndColor(anim: boolean) {
        this.button.interactable = (this.curRow == 0);
        this.node.active = (this.shelf.type == "Norm") ? (this.curRow < MatchObj.maxRowSee) : (this.curRow == 0);

        if (!anim) {
            this.node.setPosition(new Vec3(0, this.curRow * MatchObj.rowDisplacement, 0));
            return;
        }

        tween(this.node).by(0.2, { position: new Vec3(0, -MatchObj.rowDisplacement, 0) }, { easing: 'sineIn' }).start();
    }
    public RemoveFromShelf(){
        this.button.enabled = false;
        this.shelf.RemoveMatchObj(this.row, this.col);
    }
    public OnClick_button(event: Event, customEventData: string) {
        AudioManager.instance.PlayAudio(AudioType.Tap);
        GameManager.instance.PickUpMatchObj(this);
    }
}