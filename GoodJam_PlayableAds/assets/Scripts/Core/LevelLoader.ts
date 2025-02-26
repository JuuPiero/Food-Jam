import { _decorator, CCInteger, Component, easing, instantiate, JsonAsset, Node, Prefab, tween, Vec3 } from 'cc';
import { GoodsFactory } from '../Goods/GoodsFactory';
import { ILevelData } from '../Data/ILevelData';
import { Shelf } from '../Shelf/Shelf';
import { BoxManager } from './BoxManager';
import { HandleData } from './HandleData';
import { TutorialController } from './TutorialController';
import { Box } from '../Box/Box';
import { BoxSlot } from '../Slot/BoxSlot';
import { BezierTween } from '../Modules/BezierTween';
import { MovingShelf } from '../Shelf/MovingShelf';

const { ccclass, property } = _decorator;

@ccclass('LevelLoader')
export class LevelLoader extends Component {

    @property(GoodsFactory)
    goodsFactory: GoodsFactory = null;

    @property(BoxManager)
    boxManager: BoxManager = null;
    
    @property([Prefab])
    prefabsShelf: Prefab[] = [];

    @property(Node)
    tutNode: Node = null;

    @property(Node)
    tutParent: Node = null;

    @property(Node)
    shelfContainer: Node = null;

    @property(CCInteger)
    tutShelfIndex: number;

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
    private _shelfs: Shelf[] = [];
    private _movingShelfs: MovingShelf[][] = [];
    private static _instance: LevelLoader = null;
    public static get Instance(): LevelLoader {
        return LevelLoader._instance;
    }

    protected onLoad(): void {
        LevelLoader._instance = this;
    }

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
            this._shelfs.push(shelf);
        }

        this.boxManager.initialize(data);
        if(TutorialController.Instance.enableTut)
            this.onTut();
        
       
    }
onTut()
{
    
     
        TutorialController.Instance.OnTut();
        let tutObject = this.goodsFactory.createGoodsTut(this.boxManager.tutorialID);
        this.tutNode = tutObject.node;
        this.tutNode.parent = this.boxManager.nodeTopLayer;
        this.tutParent = this.boxManager.nodePositions[0].children[0].getComponent(Box).nodeSlots.children[0].getComponent(BoxSlot).nodeParent;
        var targetTutObj = this.shelfContainer.children[this.tutShelfIndex].getComponent(Shelf).currentLayer.getGoods()[1];
        this.tutNode.setWorldPosition(targetTutObj.node.getWorldPosition());
        this.tutNode.setWorldScale(targetTutObj.node.getWorldScale());
        var pos = targetTutObj.node.getWorldPosition()
        TutorialController.Instance.tutHand.parent = targetTutObj.node;
        TutorialController.Instance.tutHand.setPosition(Vec3.ZERO);
        setTimeout(()=>{ this.animTut();},1000);
        
   
}
animTut()
    {
        var targetTutObj = this.shelfContainer.children[this.tutShelfIndex].getComponent(Shelf).currentLayer.getGoods()[1];
        
        if(!targetTutObj || !this.tutNode || targetTutObj.node.active == false || this.tutNode.active ==false)
            return;
        this.tutNode.setWorldPosition(targetTutObj.node.getWorldPosition());
        this.tutNode.setWorldScale(targetTutObj.node.getWorldScale());

        this.jump(this.tutNode);
        setTimeout(()=>{ this.animTut();},1500)
        // tween(this.tutNode)
        // .to(1,{worldPosition: this.tutParent.getWorldPosition()})
        // .call(()=>{this.animTut();})
        // .start()
    }

    jump(target: Node)
    {
        tween(target)
        .to(1,{worldScale: this.tutParent.getWorldScale()})
        .start();

        BezierTween(target, 1 , target.getWorldPosition(), new Vec3(this.tutParent.worldPosition.x, this.tutParent.worldPosition.y + 500, this.tutParent.worldPosition.z), this.tutParent.worldPosition)
        .then(()=>{
            tween(target)
            .to(.1,{scale: new Vec3(target.getScale().x*1.25,target.getScale().y *.75,target.getScale().z)})
            .call(()=>{
                tween(target)
                .to(.1,{scale: new Vec3(target.getScale().x/1.25,target.getScale().y /.75,target.getScale().z)})
                .start();
        })
            .start();
    });
}

    public reset(): void {

    }

    public getShelves(): Shelf[] {
        return this._shelfs;
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