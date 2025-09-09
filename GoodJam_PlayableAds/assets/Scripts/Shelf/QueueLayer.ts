import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { IItemsLayerData } from '../Data/ILevelData';
import { ShelfLayer } from './Layer/ShelfLayer';
import { Shelf } from './Shelf';
const { ccclass, property } = _decorator;

@ccclass('Queuelayer')
export class Queuelayer extends Component {
    
    @property(Prefab)
    prefabLayer: Prefab = null;

    @property(Node)
    nodeParent: Node = null;

    public shelf: Shelf = null;
    public layers: ShelfLayer[] = [];

    public initialize(data: IItemsLayerData[]): Queuelayer {
        // Vì thứ tự render của Cocos nên cần duyệt for ngược để phần tử đầu tiên được hiển thị trên cùng
        for (let i = data.length - 1; i >= 0; i--) {
            let nodeLayer = instantiate(this.prefabLayer);
            nodeLayer.setParent(this.nodeParent);
            nodeLayer.setPosition(new Vec3(0,0,0));
            let layer = nodeLayer.getComponent(ShelfLayer);
            layer.shelf = this.shelf;
            layer.initialize(data[i]);
            this.layers.push(layer);
        }
        this.sort(this.layers);
        return this;
    }

    public removeAll(): void {
        this.node.removeAllChildren();
        this.layers = [];
    }

    public pop(): ShelfLayer {
        return this.layers.pop();
    }

    private sort(layers: ShelfLayer[]): void {
        let spacingY = 8;
        let y: number = 0;
        for (let i = 0; i < layers.length; i++) {
            let pos = new Vec3(0, y, 0);
            layers[i].node.setPosition(pos);
            y += spacingY;
        }
    }

}


