import { _decorator, Component, instantiate, JsonAsset, Layers, Node, Prefab, Sprite, SpriteFrame, TextAsset, Vec2, Vec3 } from 'cc';
import { GoodsFactory } from '../Goods/GoodsFactory';
import { EShelfType, ILevelData } from '../Data/ILevelData';
import { Shelf } from '../Shelf/Shelf';

const { ccclass, property } = _decorator;

@ccclass('MapLoader')
export class MapLoader extends Component {

    @property(GoodsFactory)
    goodsFactory: GoodsFactory = null;

    @property([Prefab])
    prefabsShelf: Prefab[] = [];

    @property([JsonAsset])
    jsonLevelData: JsonAsset[] = [];

    @property(Node)
    nodeLevelParent: Node = null;

    @property
    columns: number = 0;

    @property
    spacingX: number = 0;

    @property
    spacingY: number = 0;

    public currentLevel: number = 0;

    public initialize(level: number): void {
        this.nodeLevelParent.removeAllChildren();
        let data = this.jsonLevelData[level].json as ILevelData;
        let shelfData = data.cells;
        let positions = this.getPositionByColumn(shelfData.length, this.columns);
        for (let i = 0; i < shelfData.length; i++) {
            // Create shelf
            let prefab = this.prefabsShelf[data.cells[i].cellType];
            let nodeShelf = instantiate(prefab);
            this.nodeLevelParent.addChild(nodeShelf);
            nodeShelf.setPosition(positions[i]);

            // Create layers
            let shelf = nodeShelf.getComponent(Shelf);
            shelf.goodsFactory = this.goodsFactory;
            shelf.initialize(data.cells[i]);
        }
    }

    public reset(): void {

    }

    private getPositionByColumn(total: number, columns: number): Vec3[] {
        const positions: Vec3[] = [];
        const rows = Math.ceil(total / columns);
        const startX = -((columns - 1) * this.spacingX) / 2;
        const startY = -((rows - 1) * this.spacingY) / 2;
    
        for (let i = 0; i < total; i++) {
            const col = i % columns;
            const row = Math.floor(i / columns);
            const x = startX + col * this.spacingX;
            const y = startY + row * this.spacingY;
            positions.push(new Vec3(x, y, 0));
        }
    
        return positions;
    }
}