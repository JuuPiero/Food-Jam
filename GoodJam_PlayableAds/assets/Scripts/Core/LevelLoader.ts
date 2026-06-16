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
import { Lock } from '../Lock/Lock';
import { DifficultCurve } from './DifficultCurve';
import { GoodsBase } from '../Base/GoodsBase';

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

    @property
    indexTutGoods: number = 0;

    @property(Node)
    nodeShadowContainer: Node = null;

    public locks: Lock[] = [];
    public currentLevel: number = 0;
    private _shelfs: Shelf[] = [];
    private _fallingShelves: Shelf[] = [];
    private _listFallingShelf: Shelf[][] = [];
    private _totalItems: number = 0;
    private _pickedItems: number = 0;

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

        // Reset progress counters
        this.resetProgressCounters();
        this._totalItems = this.computeTotalItems(data);

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
            nodeShelf.name = "Shelf_" + i;

            // Create layers
            const shelf = nodeShelf.getComponent(Shelf);
            shelf.boxManager = this.boxManager;
            shelf.goodsFactory = this.goodsFactory;
            shelf.initialize(data.cells[i]);
            if (data.cells[i].locked) {
                this.locks.push(shelf.lock);
            }
            this._shelfs.push(shelf);
        }

        //Tính điểm lần đầu
        DifficultCurve.instance.calculateAndStore();

        // Đồng bộ tutorialID theo đúng món hàng mà tutorial trỏ tới,
        // phải thực hiện TRƯỚC khi BoxManager.initialize() spawn box tutorial.
        if (TutorialController.Instance.enableTut) {
            this.syncTutorialId();
        }

        this.boxManager.initialize(data);
        if (TutorialController.Instance.enableTut) {
            this.onTut();
        }
        this._listFallingShelf = this.setupFallingShelf(this._fallingShelves);
    }

    public hintGoodsBySmoke(): void {
        let boxes = this.boxManager.getActiveBoxes();

        // Kiểm tra nếu không có box nào hoặc mảng rỗng
        if (!boxes || boxes.length === 0) {
            return;
        }

        // Tìm box có nhiều item nhất
        let maxBox = boxes.reduce((max, box) => {
            if (!max || !box) return box || max;
            return box.getSlots().length > max.getSlots().length ? box : max;
        }, boxes[0]);

        // Kiểm tra maxBox có tồn tại không
        if (!maxBox) {
            return;
        }

        let id = maxBox.getId();
        let shelves = this.getShelves();
        shelves.forEach(shelf => {
            let goods = shelf.getGoods();
            let good = goods.find(good => good?.getId() === id);
            if (good) {
                good.playSmokeAnim();
            }
        });
    }

    //#region Tutorial sync
    /**
     * Đồng bộ tutorialID của BoxManager theo đúng món hàng mà tutorial đang trỏ tới.
     * Nhờ vậy chỉ cần chỉnh tutShelfIndex / indexTutGoods trong LevelLoader,
     * không cần chỉnh tutorialID thủ công bên BoxManager.
     */
    private syncTutorialId(): void {
        let tutGoods = this.getTutorialGoods();
        if (tutGoods) {
            this.boxManager.tutorialID = tutGoods.getId();
        }
    }

    /**
     * Lấy món hàng tutorial dựa trên tutShelfIndex và indexTutGoods.
     * Trả về null nếu index không hợp lệ hoặc slot rỗng.
     */
    private getTutorialGoods(): GoodsBase {
        let shelfNode = this.nodeLevelParent.children[this.tutShelfIndex];
        if (!shelfNode) {
            return null;
        }
        let shelf = shelfNode.getComponent(Shelf);
        if (!shelf) {
            return null;
        }
        return shelf.getGoods()[this.indexTutGoods] ?? null;
    }
    //#endregion

    onTut() {

        TutorialController.Instance.OnTut();
        let tutObject = this.goodsFactory.createGoodsTut(this.boxManager.tutorialID);
        this.tutNode = tutObject.node;
        this.tutNode.parent = this.boxManager.nodeTopLayer;
        this.tutParent = this.boxManager.nodePositions[0].children[0].getComponent(Box).nodeSlots.children[0].getComponent(BoxSlot).nodeParent;
        var targetTutObj = this.getTutorialGoods();
        if (!targetTutObj) {
            return;
        }
        this.tutNode.setWorldPosition(targetTutObj.node.getWorldPosition());
        this.tutNode.setWorldScale(targetTutObj.node.getWorldScale());
        var pos = targetTutObj.node.getWorldPosition()
        TutorialController.Instance.tutHand.parent = targetTutObj.node;
        TutorialController.Instance.tutHand.setPosition(Vec3.ZERO);
        setTimeout(() => { this.animTut(); }, 1000);

    }

    animTut() {
        var targetTutObj = this.getTutorialGoods();

        if (!targetTutObj || !this.tutNode || targetTutObj.node.active == false || this.tutNode.active == false)
            return;
        this.tutNode.setWorldPosition(targetTutObj.node.getWorldPosition());
        this.tutNode.setWorldScale(targetTutObj.node.getWorldScale());

        this.jump(this.tutNode);
        setTimeout(() => { this.animTut(); }, 1500)
        // tween(this.tutNode)
        // .to(1,{worldPosition: this.tutParent.getWorldPosition()})
        // .call(()=>{this.animTut();})
        // .start()
    }

    jump(target: Node) {
        tween(target)
            .to(1, { worldScale: this.tutParent.getWorldScale() })
            .start();

        BezierTween(target, 1, target.getWorldPosition(), new Vec3(this.tutParent.worldPosition.x, this.tutParent.worldPosition.y + 500, this.tutParent.worldPosition.z), this.tutParent.worldPosition)
            .then(() => {
                tween(target)
                    .to(.1, { scale: new Vec3(target.getScale().x * 1.25, target.getScale().y * .75, target.getScale().z) })
                    .call(() => {
                        tween(target)
                            .to(.1, { scale: new Vec3(target.getScale().x / 1.25, target.getScale().y / .75, target.getScale().z) })
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

    //#region onItemPicked
    public onItemPicked(): void {
        this._pickedItems++;
    }
    //#endregion

    //#region getProgressByItemPicked
    public getProgressByItemPicked(): number {
        if (this._totalItems <= 0)
            return 0;
        return Math.min(1, this._pickedItems / this._totalItems);
    }
    //#endregion

    //#region computeTotalItems
    private computeTotalItems(data: ILevelData): number {
        if (!data || !data.cells)
            return 0;
        let total = 0;
        data.cells.forEach(cell => {
            cell.itemsLayer.forEach(layer => {
                layer.items.forEach(item => {
                    if (item !== 0)
                        total++;
                });
            });
        });
        return total;
    }
    //#endregion

    //#region resetProgressCounters
    private resetProgressCounters(): void {
        this._totalItems = 0;
        this._pickedItems = 0;
    }
    //#endregion

    public setupFallingShelf(shelves: Shelf[]): Shelf[][] {
        // Lấy tất cả tọa độ Y
        let wPosX = [];
        shelves.forEach(shelf => {
            let pos = shelf.node.getWorldPosition();
            if (!wPosX.includes(pos.x)) {
                wPosX.push(pos.x);
            }
        });
        // Tạo list các shelf cùng tọa độ Y
        let array: Shelf[][] = [];
        for (let i = 0; i < wPosX.length; ++i) {
            let arr = [];
            let x = wPosX[i];
            for (let j = 0; j < shelves.length; ++j) {
                if (shelves[j].node.getWorldPosition().x === x) {
                    arr.push(shelves[j]);
                }
            }
            array.push(arr);
        }

        array.forEach(arr => {
            // Sort tọa độ x lớn dần.
            arr.sort((a, b) => a.node.getPosition().y - b.node.getPosition().y);
            // Set top/bot cho Shelf
            for (let i = 0; i < arr.length; ++i) {
                let bottom = arr[i - 1];
                let top = arr[i + 1];
                let currentShelf = arr[i];
                currentShelf.bottom = bottom ? bottom : null;
                currentShelf.top = top ? top : null;
            }
        })
        return array;
    }

    private getPositionByColumn(data: ILevelData): Vec3[] {
        let positions: Vec3[] = [];
        for (let i = 0; i < data.cells.length; i++) {
            let shelf = data.cells[i];
            positions.push(new Vec3(shelf.posX * 75, shelf.posY * 80, 0));
        }
        return positions;
    }

   
}