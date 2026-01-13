import { _decorator, Camera, Component, Enum, Node, screen, Vec3 } from 'cc';
import { Shelf } from '../Shelf/Shelf';

const { ccclass, property, executeInEditMode } = _decorator;

enum ShelfSpacingAxis {
    HORIZONTAL,
    VERTICAL
}

@ccclass('GameSync')
@executeInEditMode(true)
export class GameSync extends Component {
    
    @property(Camera)
    gameCamera: Camera = null;

    @property(Camera)
    uiCamera: Camera = null;

    @property(Node)
    nodeTarget: Node = null;

    @property
    useScaleByScreenSize: boolean = false;

    @property({ tooltip: 'Bật để điều chỉnh khoảng cách giữa các Shelf bằng ratio' })
    enableShelfSpacingAdjust: boolean = false;

    @property({
        type: Enum(ShelfSpacingAxis),
        visible(this: GameSync) {
            return this.enableShelfSpacingAdjust;
        },
        tooltip: 'Trục áp dụng giãn cách (ngang hoặc dọc)'
    })
    shelfSpacingAxis: ShelfSpacingAxis = ShelfSpacingAxis.VERTICAL;

    @property({
        visible(this: GameSync) {
            return this.enableShelfSpacingAdjust;
        },
        tooltip: 'Hệ số nhân để điều chỉnh tỷ lệ giãn khoảng cách (1.0 = mặc định, >1.0 = tăng, <1.0 = giảm)'
    })
    shelfSpacingMultiplier: number = 1.0;

    private _tempUIPos: Vec3 = new Vec3();
    private _tempGamePos: Vec3 = new Vec3();
    private _originalShelfPositions: Array<Vec3 | null> = [];
    private _shelfNodes: Node[] = [];
    private _lastSpacingEnabled: boolean = false;
    private _lastSpacingRatio: number = 1;
    private _lastSpacingAxis: ShelfSpacingAxis = ShelfSpacingAxis.VERTICAL;
    private _lastSpacingMultiplier: number = 1.0;

    protected onEnable(): void {
        this.update(null);
        this.collectShelfNodes();
        this.refreshShelfSpacingState(true);
    }

    protected onLoad(): void {
        this.collectShelfNodes();
    }

    protected update(dt: number): void {
        if (this.useScaleByScreenSize) {
            let scale = this.node.getScale();
            let realRatio = this.getRealRatio();
            this.nodeTarget.setScale(scale.multiplyScalar(realRatio));
        }
        else {
            this.nodeTarget.setScale(this.node.getScale());
        }
        this.nodeTarget.active = this.node.active;

        let worldPos = this.node.getWorldPosition();
        this.uiCamera.worldToScreen(worldPos, this._tempUIPos);
        this.gameCamera.screenToWorld(this._tempUIPos, this._tempGamePos);

        this.nodeTarget.setWorldPosition(this._tempGamePos);  
        this.refreshShelfSpacingState();
    }

    private getRealRatio(): number {
        let size = screen.windowSize;
        let designRatio = 1080 / 1920;
        let realRatio = size.width / size.height;
        return designRatio / realRatio;
    }

    private refreshShelfSpacingState(force: boolean = false): void {
        if (!this.enableShelfSpacingAdjust && !this._lastSpacingEnabled) {
            return;
        }

        if (this.ensureShelfNodesSynced() === false) {
            return;
        }

        if (!this.enableShelfSpacingAdjust && this._lastSpacingEnabled) {
            this.restoreShelfPositions();
            this._lastSpacingEnabled = false;
            return;
        }

        const currentRatio = this.getRealRatio();
        const ratioChanged = this._lastSpacingRatio !== currentRatio;
        const axisChanged = this._lastSpacingAxis !== this.shelfSpacingAxis;
        const multiplierChanged = this._lastSpacingMultiplier !== this.shelfSpacingMultiplier;

        if (force || !this._lastSpacingEnabled || ratioChanged || axisChanged || multiplierChanged) {
            this.applyShelfSpacing(currentRatio);
            this._lastSpacingEnabled = true;
            this._lastSpacingRatio = currentRatio;
            this._lastSpacingAxis = this.shelfSpacingAxis;
            this._lastSpacingMultiplier = this.shelfSpacingMultiplier;
        }
    }

    private collectShelfNodes(): void {
        const scene = this.node?.scene;
        if (!scene) {
            this._shelfNodes = [];
            this._originalShelfPositions = [];
            return;
        }
        const shelves = scene.getComponentsInChildren(Shelf);
        this._shelfNodes = shelves.map(shelf => shelf.node);
        this._originalShelfPositions = this._shelfNodes.map(node => node ? node.getPosition().clone() : null);
    }

    private ensureShelfNodesSynced(): boolean {
        const scene = this.node?.scene;
        if (!scene) {
            return false;
        }
        const shelves = scene.getComponentsInChildren(Shelf);
        if (shelves.length !== this._shelfNodes.length) {
            this.collectShelfNodes();
        }
        return this._shelfNodes.length > 0;
    }

    private restoreShelfPositions(): void {
        for (let i = 0; i < this._shelfNodes.length; i++) {
            const node = this._shelfNodes[i];
            const original = this._originalShelfPositions[i];
            if (!node || !original) {
                continue;
            }
            node.setPosition(original);
        }
    }

    private applyShelfSpacing(spacingRatio: number): void {
        // Tìm shelf có tọa độ gốc (x=0 hoặc y=0) làm anchor cố định
        const anchor = this.getAnchorPosition();
        if (!anchor) {
            return;
        }
        
        // Áp dụng multiplier để điều chỉnh tỷ lệ giãn khoảng cách
        const adjustedRatio = spacingRatio * this.shelfSpacingMultiplier;
        
        for (let i = 0; i < this._shelfNodes.length; i++) {
            const node = this._shelfNodes[i];
            const original = this._originalShelfPositions[i];
            if (!node || !original) {
                continue;
            }
            
            const adjusted = original.clone();
            if (this.shelfSpacingAxis === ShelfSpacingAxis.HORIZONTAL) {
                // Shelf có x = 0 giữ nguyên vị trí (làm anchor)
                if (Math.abs(original.x) < 0.001) {
                    continue;
                }
                // Các shelf khác được điều chỉnh dựa trên khoảng cách từ anchor
                adjusted.x = anchor.x + (original.x - anchor.x) * adjustedRatio;
            } else {
                // Shelf có y = 0 giữ nguyên vị trí (làm anchor)
                if (Math.abs(original.y) < 0.001) {
                    continue;
                }
                // Các shelf khác được điều chỉnh dựa trên khoảng cách từ anchor
                adjusted.y = anchor.y + (original.y - anchor.y) * adjustedRatio;
            }
            node.setPosition(adjusted);
        }
    }

    private getAnchorPosition(): Vec3 | null {
        // Tìm shelf có tọa độ gốc (x=0 hoặc y=0) làm anchor cố định
        // Đây là shelf ở giữa, sẽ không bị thay đổi và làm mốc tham chiếu
        for (let i = 0; i < this._originalShelfPositions.length; i++) {
            const pos = this._originalShelfPositions[i];
            if (!pos) {
                continue;
            }
            // Nếu axis là HORIZONTAL, tìm shelf có x = 0
            // Nếu axis là VERTICAL, tìm shelf có y = 0
            if (this.shelfSpacingAxis === ShelfSpacingAxis.HORIZONTAL) {
                if (Math.abs(pos.x) < 0.001) {
                    return pos.clone();
                }
            } else {
                if (Math.abs(pos.y) < 0.001) {
                    return pos.clone();
                }
            }
        }
        // Nếu không tìm thấy shelf có tọa độ gốc, trả về vị trí đầu tiên không null
        for (let i = 0; i < this._originalShelfPositions.length; i++) {
            const pos = this._originalShelfPositions[i];
            if (pos) {
                return pos.clone();
            }
        }
        return null;
    }
}


