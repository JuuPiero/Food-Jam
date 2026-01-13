import { _decorator, Button, Component, EventKeyboard, Input, input, KeyCode, Label } from 'cc';
 import { LevelLoader } from './Core/LevelLoader';
 import { GameManager } from './Core/GameManager';
 import { Goods } from './Goods/Goods';
 const { ccclass, property } = _decorator;
 @ccclass('AutoPlay')
 export class AutoPlay extends Component {
    @property({type: Button})
    buttonAutoPlay: Button = null;

    @property(Label)
    txtProgress: Label = null;
    
    private _isRunning: boolean = false;
    private _showProgress: boolean = false;
    private _updateProgressHandler = (): void =>
    {
        this.updateProgressDisplay();
    };
    //#region start
    start(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        if (this.txtProgress) {
            this.txtProgress.node.active = false;
        }
    }
    //#endregion
    //#region onDestroy
    onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    //#endregion
    //#region onKeyDown
    private onKeyDown(event: EventKeyboard): void {
        if (event.keyCode === KeyCode.KEY_S) {
            this.startAutoTest();
        }
        if (event.keyCode === KeyCode.KEY_P) {
            this.toggleProgressDisplay();
        }
    }
    //#endregion
    //#region startAutoTest
    private startAutoTest(): void {
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;
        this.runAutoStep();
    }
    //#endregion
    //#region runAutoStep
    private runAutoStep(): void {
        const hasPicked = this.tryPickMatchingGoods();
        this.updateProgressDisplay();
        if (!hasPicked) {
            this._isRunning = false;
            return;
        }
        // Thêm trễ nhỏ để tránh nghẽn CPU khi autotest chạy liên tục
        this.scheduleOnce(() => this.runAutoStep(), 0.1);
    }
    //#endregion
    //#region tryPickMatchingGoods
    /**
     * Duyệt qua tất cả box đang active và tìm goods có id trùng khớp
     * trong các goods pick được của mỗi shelf (mainLayer).
     * Trả về true nếu pick được ít nhất một goods, false nếu không tìm thấy goods nào phù hợp.
     */
    private tryPickMatchingGoods(): boolean {
        const levelLoader = LevelLoader.Instance ?? GameManager.Instance?.levelLoader;
        const boxManager = levelLoader?.boxManager;
        if (!levelLoader || !boxManager) {
            return false;
        }
        const boxes = boxManager.getBoxesActive?.() ?? [];
        const shelves = levelLoader.getShelves?.() ?? [];
        if (!boxes.length || !shelves.length) {
            return false;
        }
        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            if (box?.isFull && box.isFull()) {
                continue;
            }
            const targetId = box?.getId?.();
            if (targetId === null || targetId === undefined) {
                continue;
            }
            for (let j = 0; j < shelves.length; j++) {
                const shelf = shelves[j];
                if (!shelf || !shelf.getGoods) {
                    continue;
                }
                // Chỉ lấy goods từ mainLayer (layer pick được)
                const goodsList = shelf.getGoods() ?? [];
                for (let k = 0; k < goodsList.length; k++) {
                    const good = goodsList[k] as Goods;
                    if (!good || !good.getId || good.getId() !== targetId) {
                        continue;
                    }
                    good.pickUp();
                    return true;
                }
            }
        }
        return false;
    }
    //#endregion

    //#region toggleProgressDisplay
    /**
     * Toggle hiển thị/ẩn progress display khi bấm phím P
     */
    private toggleProgressDisplay(): void {
        if (!this.txtProgress) {
            return;
        }
        this._showProgress = !this._showProgress;
        this.txtProgress.node.active = this._showProgress;
        
        if (this._showProgress) {
            this.updateProgressDisplay();
            // Schedule update liên tục mỗi 0.2s
            this.schedule(this._updateProgressHandler, 0.2);
        } else {
            this.unschedule(this._updateProgressHandler);
        }
    }
    //#endregion

    //#region updateProgressDisplay
    /**
     * Cập nhật hiển thị progress theo %
     */
    private updateProgressDisplay(): void {
        if (!this.txtProgress || !this._showProgress) {
            return;
        }
        const levelLoader = LevelLoader.Instance ?? GameManager.Instance?.levelLoader;
        if (!levelLoader || !levelLoader.getProgressByItemPicked) {
            this.txtProgress.string = "Progress: N/A";
            return;
        }
        const progress = levelLoader.getProgressByItemPicked();
        const percentage = (progress * 100).toFixed(1);
        this.txtProgress.string = `Progress: ${percentage}%`;
    }
    //#endregion
 }