import { _decorator, CCBoolean, CCInteger, Component, easing, error, instantiate, Node, NodePool, Prefab, tween, UIOpacity, Vec3 } from 'cc';
import { Box } from '../Box/Box';
import { ILevelData } from '../Data/ILevelData';
import { ObjectPool } from '../Modules/ObjectPool';
import { SlotManager } from '../Slot/SlotManager';
import { Goods } from '../Goods/Goods';
import BoxDataFactory from '../BoxDataFactory';
import { LevelLoader } from './LevelLoader';
import { GameManager } from './GameManager';
import { EGameState } from './EGameState';
import { TutorialController } from './TutorialController';
import { TextEffect } from './TextEffect';
const { ccclass, property } = _decorator;

@ccclass('BoxManager')
export class BoxManager extends Component {

    @property(SlotManager)
    slotManager: SlotManager = null;

    @property(TextEffect)
    textEffect: TextEffect = null;

    @property(Node)
    nodeTopLayer: Node = null;

    @property(Prefab)
    prefabBox: Prefab = null;

    @property([Node])
    nodePositions: Node[] = [];

    @property(CCInteger)
    tutorialID: number = 0;

    @property([UIOpacity])
    uiWarning: UIOpacity[] = [];

    enableTut: boolean = false;

    public firstBoxSpawn: boolean = false;
    public levelLoader: LevelLoader = null;
    private _pool = new NodePool();
    private _boxesActive: Box[] = [];
    private _boxes: Box[] = [];

    public initialize(data: ILevelData): void {
        this.reset();
        this.initPool();
        this.slotManager.freeSlots.forEach(slot => {
            slot.boxManager = this;
        });
        BoxDataFactory.initialize(data);
        this.enableTut = TutorialController.Instance.enableTut;
        this.fill();
    }

    public reset(): void {
        this.nodePositions.forEach(node => {
            node.removeAllChildren();
        });
    }

    public pickUp(goods: Goods): boolean {
        // Duyệt qua các box xem có box nào cùng id với goods không
        let boxMatch = null;
        for (let i = 0; i < this._boxesActive.length; i++) {
            let box = this._boxesActive[i];
            if (box.getId() === goods.getId() && !box.isFull()) {
                boxMatch = box;
                break;
            }
        }
        
        if (boxMatch) {
            let _goods = goods.slot.remove();
            boxMatch.add(_goods);
            return true;
        }
        
        // Nếu không có box trùng id thì chuyển goods sang slot free
        let freeSlot = this.slotManager.getFreeSlot();
        if (freeSlot && this.isAllBoxesReady()) {
            let _goods = goods.slot.remove();
            freeSlot.add(_goods);
            if (this.slotManager.fullSlot()) {
                GameManager.Instance.State = EGameState.LOSE;
            }
            if (this.slotManager.checkWarning()) {
                this.slotManager.showWarning();
            }
            return true;
        }
        return false;
    }

    public pickUpTut(goods: Goods) {// Duyệt qua các box xem có box nào cùng id với goods không
        let boxMatch = null;
        for (let i = 0; i < this._boxesActive.length; i++) {
            let box = this._boxesActive[i];
            if (box.getId() === goods.getId()) {
                boxMatch = box;
                break;
            }
        }
        if (boxMatch) {
            boxMatch.addTut(goods);
            return true;
        }
        // Nếu không có box trùng id thì chuyển goods sang slot free
        let freeSlot = this.slotManager.getFreeSlot();
        if (freeSlot) {
            freeSlot.add(goods);
            // if (this.slotManager.fullSlot()) {
            //     GameManager.Instance.State = EGameState.LOSE;
            // }
            return true;
        }
        return false;

    }

    public fill(): void
    {
        for (let i = 0; i < this.nodePositions.length; i++) {
            let node = this.nodePositions[i];
            if (!this.firstBoxSpawn && this.enableTut) {
                if (i == 0) {
                    if (node.children.length === 0) {
                        // Lấy danh sách ID của các box đang hoạt động
                        const activeIds = this._boxesActive.map(box => box.getId());
                        const boxData = BoxDataFactory.getBestBoxData(activeIds, 2, this.slotManager);
                        if (!boxData || !boxData.id) {
                            console.log("noooo");
                            return;
                        }
                        this.firstBoxSpawn = true;
                        let box = this.getNewBox();
                        box.levelLoader = this.levelLoader;
                        box.boxManager = this;
                        box.node.setParent(node);
                        box.node.setPosition(0, 300, 0);
                        box.initialize(boxData.id, boxData.total);
                        this._boxesActive.push(box);
                        box.isReady = false;
                        tween(box.node).to(0.3, { position: new Vec3(0, 0, 0) }, {
                            easing: easing.backOut, onComplete: () => 
                            {
                                box.isReady = true;
                            }
                         })
                            .call(() => {
                                // Lấy goods từ free slot
                                for (let j = 0; j < this.slotManager.freeSlots.length; j++) {
                                    let freeSlot = this.slotManager.freeSlots[j];
                                    if (freeSlot.isFull()) {
                                        let goods = freeSlot.getGoods();
                                        if (box.getId() === goods.getId()) {
                                            box.add(goods);
                                            freeSlot.reset();
                                        }
                                    }
                                }
                            }).start();

                    }
                }
            }
            if (node.children.length === 0) {
                // Lấy danh sách ID của các box đang hoạt động
                let activeIds = this._boxesActive.map(box => box.getId());
                let boxData = BoxDataFactory.getBestBoxData(activeIds, 2, this.slotManager);
                if (!boxData || !boxData.id) {
                    return;
                }

                let box = this.getNewBox();
                box.levelLoader = this.levelLoader;
                box.boxManager = this;
                box.node.setParent(node);
                box.node.setPosition(0, 300, 0);
                box.initialize(boxData.id, boxData.total);
                this._boxesActive.push(box);
                tween(box.node).to(0.3, { position: new Vec3(0, 0, 0) }, { easing: easing.backOut })
                    .call(() => {
                        // Lấy goods từ free slot
                        for (let j = 0; j < this.slotManager.freeSlots.length; j++) {
                            let freeSlot = this.slotManager.freeSlots[j];
                            if (freeSlot.isFull()) {
                                let goods = freeSlot.getGoods();
                                if (box.getId() === goods.getId()) {
                                    box.add(goods);
                                    freeSlot.reset();
                                }
                            }
                        }
                    }).start();
            }
        }
    }

    public onBoxComplete(box: Box): void {
        this.put(box);
        let index = this._boxesActive.indexOf(box);
        if (index > -1) {
            this._boxesActive.splice(index, 1);
        }
        let gameManager = GameManager.Instance;
        if (this.checkWin()) {
            gameManager.State = EGameState.WIN;
        }
        else {
            let state = [EGameState.WIN, EGameState.LOSE];
            if (!state.includes(gameManager.State)) {
                this.fill();
            }
        }
    }

    public getActiveBoxes(): Box[] {
        return this._boxesActive;
    }

    public getBoxesActive(): Box[] {
        return this._boxesActive;
    }

    private put(box: Box): void {
        this._pool.put(box.node);
    }

    private get(): Box {
        return null;
    }

    private initPool(): void {
        for (let i = 0; i < 5; i++) {
            let node = instantiate(this.prefabBox);
            this._pool.put(node);
        }
    }

    private getNewBox(slot: number = 3): Box {
        let node = this._pool.get();
        let box = node.getComponent(Box);
        return box;
    }

    private checkWin(): boolean {
        return this.nodePositions.every(node => node.children.length === 0);
    }

    private flashesWarning(): void {
        this.uiWarning.forEach(uiOpacity => {
            if (uiOpacity.node.activeInHierarchy) {
                let duration = 0.3
                tween(uiOpacity).to(0.25, { opacity: 255 }, { easing: easing.cubicOut })
                    .to(0.25, { opacity: 0 }, { easing: easing.cubicOut })
                    .to(0.25, { opacity: 255 }, { easing: easing.cubicOut })
                    .to(0.25, { opacity: 0 }, { easing: easing.cubicOut })
                    .to(0.25, { opacity: 255 }, { easing: easing.cubicOut })
                    .to(0.25, { opacity: 0 }, { easing: easing.cubicOut })
                    .start();
            }
        });
    }

    public getAllNeededItems(): number[]
    {
        const neededItems: number[] = [];
        const boxes = this.getActiveBoxesByAscendingNeededItems();
        boxes.forEach(box => {
            if (box.isReady && box.node.position.y === 0) {
                neededItems.push(...box.getNeededItems());
            }
        });
        return neededItems;
    }

    public getActiveBoxesByAscendingNeededItems(): Box[]
    {
        // the box with the smallest number of empty slot comes first
        return this._boxesActive.sort((a, b) => a.getEmptySlotCount() - b.getEmptySlotCount());
    }

    public isAllBoxesReady(): boolean
    {
        return this._boxesActive.every(box => box.isReady && box.node.position.y === 0);
    }
}


