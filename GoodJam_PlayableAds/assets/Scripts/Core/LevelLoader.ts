import { _decorator, Component, instantiate, JsonAsset, Layers, Node, Prefab, Sprite, SpriteFrame, TextAsset, Vec2, Vec3 } from 'cc';
import { GoodsFactory } from '../Goods/GoodsFactory';
import { EShelfType, ILevelData } from '../Data/ILevelData';
import { Shelf } from '../Shelf/Shelf';
import { BoxManager } from './BoxManager';
import { HandleData } from './HandleData';

const { ccclass, property } = _decorator;

@ccclass('LevelLoader')
export class LevelLoader extends Component {

    @property(GoodsFactory)
    goodsFactory: GoodsFactory = null;

    @property(BoxManager)
    boxManager: BoxManager = null;
    
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
        this.boxManager.levelLoader = this;
        let data = this.jsonLevelData[level].json as ILevelData;
        HandleData.updatePosition(data);
        HandleData.updatePositionSingleShelf(data);
        HandleData.sortData(data);
        let shelfData = data.cells;
        let positions = this.getPositionByColumn(data);
        for (let i = 0; i < shelfData.length; i++) {
            // Create shelf
            let prefab = this.prefabsShelf[data.cells[i].cellType];
            let nodeShelf = instantiate(prefab);
            this.nodeLevelParent.addChild(nodeShelf);
            nodeShelf.setPosition(positions[i]);

            // Create layers
            let shelf = nodeShelf.getComponent(Shelf);
            shelf.boxManager = this.boxManager;
            shelf.goodsFactory = this.goodsFactory;
            shelf.initialize(data.cells[i]);
        }
        this.boxManager.initialize(data);
    }

    public reset(): void {

    }

    // private getPositionByColumn(total: number, columns: number): Vec3[] {
    //     const positions: Vec3[] = [];
    //     const rows = Math.ceil(total / columns);
    //     const startX = -((columns - 1) * this.spacingX) / 2;
    //     const startY = -((rows - 1) * this.spacingY) / 2;
    
    //     for (let i = 0; i < total; i++) {
    //         const col = i % columns;
    //         const row = Math.floor(i / columns);
    //         const x = startX + col * this.spacingX;
    //         const y = startY + row * this.spacingY;
    //         positions.push(new Vec3(x, y, 0));
    //     }
    
    //     return positions;
    // }

    private getPositionByColumn(data: ILevelData): Vec3[] {
        let positions: Vec3[] = [];
        for (let i = 0; i < data.cells.length; i++) {
            let shelf = data.cells[i];
            positions.push(new Vec3(shelf.posX * 75, shelf.posY * 80, 0));
        }
        return positions;
    }
    
    private sortData(data: ILevelData): ILevelData {
        // Tạo một bản sao của data để không thay đổi dữ liệu gốc
        const sortedData = { ...data };
        
        // Sắp xếp mảng cells
        sortedData.cells.sort((a, b) => {
            // Nếu posY khác nhau, sắp xếp theo posY tăng dần
            if (a.posY !== b.posY) {
                return a.posY - b.posY;
            }
            // Nếu posY bằng nhau, sắp xếp theo posX giảm dần
            return b.posX - a.posX;
        });

        return sortedData;
    }
}