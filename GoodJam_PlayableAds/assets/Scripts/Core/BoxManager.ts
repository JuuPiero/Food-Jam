import { _decorator, CCBoolean, CCInteger, Component, easing, error, instantiate, Node, NodePool, Prefab, tween, UIOpacity, Vec3, log } from 'cc';
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
import { DifficultCurve } from './DifficultCurve';
import { EventType, TrackingManager } from 'db://assets/base-script/PlayableAds/Tracking/TrackingManager';
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

    @property({
        type: CCBoolean
    })
    enableDifficultCurve: boolean = false;

    @property([UIOpacity])
    uiWarning: UIOpacity[] = [];

    enableTut: boolean = false;

    public firstBoxSpawn: boolean = false;
    public levelLoader: LevelLoader = null;
    private _pool = new NodePool();
    private _boxesActive: Box[] = [];
    private _boxes: Box[] = [];
    private _lastSpawnedBoxId: number = -1;

    private _totalBoxesToWin: number = 0;
    private _completedBoxes: number = 0;
    private _trackedProgress: Set<number> = new Set<number>();

    public initialize(data: ILevelData): void {
        this.reset();
        this.initPool();
        this.initializeTrackingCounters(data);
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
            boxMatch.add(goods);
            return true;
        }
        // Nếu không có box trùng id thì chuyển goods sang slot free
        let freeSlot = this.slotManager.getFreeSlot();
        if (freeSlot) {
            freeSlot.add(goods);
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
            if (this.slotManager.fullSlot()) {
                GameManager.Instance.State = EGameState.LOSE;
            }
            return true;
        }
        return false;

    }

    public fill(): void {
        for (let i = 0; i < this.nodePositions.length; i++) {
            let node = this.nodePositions[i];
            if (!this.firstBoxSpawn && this.enableTut) {
                if (i == 0) {
                    if (node.children.length === 0) {
                        // Lấy danh sách ID của các box đang hoạt động
                        let activeIds = this._boxesActive.map(box => box.getId());
                        let boxData = BoxDataFactory.getTutorialBoxData(this.tutorialID, activeIds);
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
                        this.setLastSpawnedBoxId(boxData.id);
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
            if (node.children.length === 0) {
                let id: number;
                let total: number = 3;

                if (this.enableDifficultCurve) {
                    // Logic mới: Sử dụng DifficultCurve
                    DifficultCurve.instance.calculateAndStore();
                    DifficultCurve.instance.CalculateTargetPoint();

                    let nearMissId = DifficultCurve.instance.tryUseNearMiss();
                    id = nearMissId >= 0 ? nearMissId : DifficultCurve.instance.findNearestColorPointId();
                } else {
                    // Logic cũ: Sử dụng BoxDataFactory
                    let activeIds = this._boxesActive.map(box => box.getId());
                    let boxData = BoxDataFactory.getRandomBoxData(activeIds);
                    if (!boxData || !boxData.id) {
                        return;
                    }
                    id = boxData.id;
                    total = boxData.total;
                }
               
                let box = this.getNewBox();
                box.levelLoader = this.levelLoader;
                box.boxManager = this;
                box.node.setParent(node);
                box.node.setPosition(0, 300, 0);
                box.initialize(id, total);
                
                if (this.enableDifficultCurve) {
                    this.setLastSpawnedBoxId(id);
                    //Calculate lại target point
                    DifficultCurve.instance.CalculateTargetPoint();
                    DifficultCurve.instance.debugShow();
                }

                this._boxesActive.push(box);

                tween(box.node).to(0.3, {position: new Vec3(0, 0, 0)}, {easing: easing.backOut})
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
        this.trackProgress();
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

    //#region setLastSpawnedBoxId
    public setLastSpawnedBoxId(id: number): void {
        this._lastSpawnedBoxId = id;
    }
    //#endregion

    //#region getLastSpawnedBoxId
    public getLastSpawnedBoxId(): number {
        return this._lastSpawnedBoxId;
    }
    //#endregion

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

    private initializeTrackingCounters(data: ILevelData): void {
        // CHÚ Ý: BoxDataFactory.initialize(data) sẽ mutate level data (shift itemsLayer),
        // nên cần tính trước khi gọi initialize().
        this._completedBoxes = 0;
        this._trackedProgress.clear();

        const totalItems = this.countTotalItems(data);
        // Mỗi box tiêu thụ tối đa 3 items (BoxDataFactory logic).
        this._totalBoxesToWin = totalItems > 0 ? Math.ceil(totalItems / 3) : 0;
    }

    private countTotalItems(data: ILevelData): number {
        if (!data || !data.cells) {
            return 0;
        }
        let total = 0;
        for (let i = 0; i < data.cells.length; i++) {
            const cell = data.cells[i];
            const layers = cell?.itemsLayer || [];
            for (let j = 0; j < layers.length; j++) {
                const items = layers[j]?.items || [];
                for (let k = 0; k < items.length; k++) {
                    const id = items[k];
                    if (id !== 0) {
                        total++;
                    }
                }
            }
        }
        return total;
    }

    private trackProgress(): void {
        this._completedBoxes++;
        if (this._totalBoxesToWin <= 0) {
            return;
        }

        const progress = (this._completedBoxes / this._totalBoxesToWin) * 100;
        if (progress >= 25 && !this._trackedProgress.has(25)) {
            log(`[Tracking] Progress ${progress}% => CHALLENGE_PASS_25`);
            TrackingManager.TrackEvent(EventType.CHALLENGE_PASS_25);
            this._trackedProgress.add(25);
        }
        if (progress >= 50 && !this._trackedProgress.has(50)) {
            log(`[Tracking] Progress ${progress}% => CHALLENGE_PASS_50`);
            TrackingManager.TrackEvent(EventType.CHALLENGE_PASS_50);
            this._trackedProgress.add(50);
        }
        if (progress >= 75 && !this._trackedProgress.has(75)) {
            log(`[Tracking] Progress ${progress}% => CHALLENGE_PASS_75`);
            TrackingManager.TrackEvent(EventType.CHALLENGE_PASS_75);
            this._trackedProgress.add(75);
        }
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
}


