import { _decorator, Component, EventHandler, Node, screen } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CanvasEventListener')
export class CanvasEventListener extends Component {
    
    @property([EventHandler])
    onSizeChangedCallbacks: EventHandler[] = [];

    protected onEnable(): void {
        this.node.on(Node.EventType.SIZE_CHANGED, this.onScreenChanged, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.SIZE_CHANGED, this.onScreenChanged, this);
    }

    protected onScreenChanged(): void {
        this.onSizeChangedCallbacks.forEach(handler => {
            handler.emit([]);
        });
    }
}


