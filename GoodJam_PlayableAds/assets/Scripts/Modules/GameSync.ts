import { _decorator, Component, Node, Vec3 } from 'cc';
import { Camera } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameSync')
export class GameSync extends Component {
    
    @property(Camera)
    gameCamera: Camera = null;

    @property(Camera)
    uiCamera: Camera = null;

    @property(Node)
    nodeTarget: Node = null;

    private _tempUIPos: Vec3 = new Vec3();
    private _tempGamePos: Vec3 = new Vec3();

    protected update(dt: number): void {
        this.nodeTarget.active = this.node.active;
        this.nodeTarget.setScale(this.node.getScale());

        let worldPos = this.node.getWorldPosition();
        this.uiCamera.worldToScreen(worldPos, this._tempUIPos);
        this.gameCamera.screenToWorld(this._tempUIPos, this._tempGamePos);

        this.nodeTarget.setWorldPosition(this._tempGamePos);  
    }
}


