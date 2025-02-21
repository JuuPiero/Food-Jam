import { _decorator, CCInteger, Component, easing, instantiate, Node, NodePool, Prefab, tween, Vec3 } from 'cc';
import { Box } from '../Box/Box';
import { ILevelData } from '../Data/ILevelData';
import { ObjectPool } from '../Modules/ObjectPool';
import { SlotManager } from '../Slot/SlotManager';
import { Goods } from '../Goods/Goods';
import BoxDataFactory from '../BoxDataFactory';
import { LevelLoader } from './LevelLoader';
import { GameManager } from './GameManager';
import { EGameState } from './EGameState';
const { ccclass, property } = _decorator;

@ccclass('BoxManager')
export class BoxManager extends Component {
    
    @property(SlotManager)
    slotManager: SlotManager = null;

    @property(Node)
    nodeTopLayer: Node = null;

    @property(Prefab)
    prefabBox: Prefab = null;

    @property([Node])
    nodePositions: Node[] = [];
    
    @property(CCInteger)
    tutorialID: number = 0;

    public firstBoxSpawn: boolean = false;
    public levelLoader: LevelLoader = null;
    private _pool = new NodePool();
    private _boxesActive: Box[] = [];
    private _boxes: Box[] = [];
    public static instance:BoxManager;
    
    protected onLoad(): void {
    BoxManager.instance = this;
}   
    public initialize(data: ILevelData): void {
        this.reset();
        this.initPool();
        this.slotManager.freeSlots.forEach(slot => {
            slot.boxManager = this;
        });
        BoxDataFactory.initialize(data);
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
            if (box.getId() === goods.getId()) {
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
            return true;
        }
        return false;
    }
    public pickUpTut(goods:Goods)
    {// Duyệt qua các box xem có box nào cùng id với goods không
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
            if(i==0)
            {
                if(!this.firstBoxSpawn)
                {
                    if (node.children.length === 0) {
                        let boxData = BoxDataFactory.getTutorialBoxData(this.tutorialID);
                        if (!boxData || !boxData.id) {
                            console.log("noooo");
                            return;
                        }
                        this.firstBoxSpawn=true;
                        let box = this.getNewBox();
                        box.levelLoader = this.levelLoader;
                        box.boxManager = this;
                        box.node.setParent(node);
                        box.node.setPosition(0, 300, 0);
                        box.initialize(boxData.id, boxData.total);
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
            if (node.children.length === 0) {
                let boxData = BoxDataFactory.getRandomBoxData();
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
}


