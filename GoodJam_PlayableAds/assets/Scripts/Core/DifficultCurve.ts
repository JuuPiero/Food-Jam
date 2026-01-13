import { _decorator, Component, Label, Vec2, log, find } from 'cc';
import { LevelLoader } from './LevelLoader';
import { Shelf } from '../Shelf/Shelf';
import { ShelfLayer } from '../Shelf/Layer/ShelfLayer';
import { Goods, EGoodsState } from '../Goods/Goods';
import { SlotManager } from '../Slot/SlotManager';
import { BoxManager } from './BoxManager';

const { ccclass, property } = _decorator;

@ccclass( 'DifficultCurve' )
export class DifficultCurve extends Component
{
    public static instance: DifficultCurve = null;

    @property( { type: SlotManager } )
    public slotManager: SlotManager = null;

    @property( { type: Label } )
    public debugLabel: Label = null;

    @property( { type: [ Vec2 ] } )
    public diffCurvePoints: Vec2[] = [];

    private MAX_LAYER = 3;
    private _colorPoints: Map<number, number> = new Map();
    private _targetPoint: number = 0;
    private _nearMissCount: number = 1;
    private boxManager: BoxManager = null;

    //#region onLoad
    onLoad (): void
    {
        DifficultCurve.instance = this;
        this.boxManager = find( "" ).getComponentInChildren( BoxManager );
    }
    //#endregion

    //#region calculateColorPoints
    /**
     * Tính điểm color point cho từng itemID.
     * - Chỉ xét các goods trong 3 layer (tính từ mainLayer + các layer gần mainLayer nhất từ queueLayer).
     * - Điểm của itemID = tổng 3 giá trị goodPoint thấp nhất của id đó (nếu <3 goods thì cộng hết).
     * 
     * Lưu ý về QueueLayer:
     * - QueueLayer hoạt động như stack: pop() lấy phần tử CUỐI (layer gần mainLayer nhất).
     * - Vì vậy, khi chọn layers từ queueLayer, ta lấy từ CUỐI mảng (các layer gần mainLayer nhất).
     */
    public calculateColorPoints ( shelves: Shelf[] ): Map<number, number>
    {
        const result = new Map<number, number>();
        if ( !shelves || shelves.length === 0 )
            return result;

        const goodsById: Map<number, number[]> = new Map();

        shelves.forEach( shelf =>
        {
            // Xây dựng danh sách layers để xét: mainLayer + các layer từ queueLayer
            const layers: ShelfLayer[] = [];

            // Thêm mainLayer (layer hiện tại đang pick được - tương đương currentLayer cũ)
            if ( shelf.mainLayer )
                layers.push( shelf.mainLayer );

            // QueueLayer là stack: pop() lấy phần tử CUỐI => layer gần mainLayer nhất ở cuối mảng.
            // Cần lấy tối đa (MAX_LAYER - 1) layers từ CUỐI mảng queueLayer.layers
            if ( shelf.queueLayer && shelf.queueLayer.layers )
            {
                const allQueueLayers = shelf.queueLayer.layers;
                const maxQueueLayers = Math.max( 0, this.MAX_LAYER - 1 );
                // Lấy từ cuối mảng: slice(startIndex) với startIndex = length - maxQueueLayers
                const startIndex = Math.max( 0, allQueueLayers.length - maxQueueLayers );
                const queueLayers = allQueueLayers.slice( startIndex );
                layers.push( ...queueLayers );
            }

            // Duyệt qua các layers đã chọn (tương đương logic cũ: loop từ currentIndex xuống)
            let collected = 0;
            for ( let i = 0; i < layers.length && collected < this.MAX_LAYER; i++, collected++ )
            {
                const layer = layers[ i ];
                if ( !layer )
                    continue;
                const goods = layer.getAllGoods ? layer.getAllGoods() : [];
                goods.forEach( good =>
                {
                    if ( good && good instanceof Goods )
                    {
                        const id = good.getId();
                        if ( id === 0 )
                            return;
                        if ( good.State === EGoodsState.PICKED )
                            return;
                        const list = goodsById.get( id ) || [];
                        list.push( good.goodPoint );
                        goodsById.set( id, list );
                    }
                } );
            }
        } );

        goodsById.forEach( ( points, id ) =>
        {
            points.sort( ( a, b ) => a - b );
            const sum = points.slice( 0, 3 ).reduce( ( acc, cur ) => acc + cur, 0 );
            result.set( id, sum );
        } );

        return result;
    }
    //#endregion

    //#region calculateAndStore
    /**
     * Tính và lưu colorPoints vào instance.
     */
    public calculateAndStore (): Map<number, number>
    {
        this._colorPoints = this.calculateColorPoints( LevelLoader.Instance.getShelves() );
        return this._colorPoints;
    }
    //#endregion

    //#region calculateActiveBoxesColorPoint
    public calculateActiveBoxesColorPoint (): number
    {
        const boxes = this.boxManager.getBoxesActive ? this.boxManager.getBoxesActive() : [];
        let total = 0;
        boxes.forEach( box =>
        {
            if ( !box || !box.getId )
                return;
            const id = box.getId();
            const value = this._colorPoints.get( id ) || 0;
            total += value;
        } );
        return total;
    }
    //#endregion

    //#region getExcludedIds
    /**
     * Lấy danh sách ID cần loại trừ: từ active boxes và FreeSlot.
     * Tránh spawn box trùng với box đang active hoặc goods đang chờ trong FreeSlot.
     */
    private getExcludedIds (): Set<number>
    {
        const excludedIds = new Set<number>();

        // Loại trừ ID từ active boxes
        const boxes = this.boxManager?.getBoxesActive ? this.boxManager.getBoxesActive() : [];
        boxes.forEach( box =>
        {
            if ( box && box.getId )
                excludedIds.add( box.getId() );
        } );

        // Loại trừ ID từ FreeSlot để tránh spawn box trùng với goods đang chờ
        if ( this.slotManager && this.slotManager.freeSlots )
        {
            this.slotManager.freeSlots.forEach( slot =>
            {
                if ( slot && slot.isFull && slot.isFull() )
                {
                    const goods = slot.getGoods ? slot.getGoods() : null;
                    if ( goods && goods.getId )
                    {
                        const goodsId = goods.getId();
                        if ( goodsId !== undefined && goodsId !== null )
                            excludedIds.add( goodsId );
                    }
                }
            } );
        }

        return excludedIds;
    }
    //#endregion

    //#region CalculateTargetPoint
    public CalculateTargetPoint (): void
    {
        log( 'CalculateTargetPoint' );
        if ( !LevelLoader.Instance || !this.slotManager )
            return;

        let currentPoint = this.evaluateDiffCurve( LevelLoader.Instance.getProgressByItemPicked() );
        log( 'currentPoint', currentPoint );
        this._targetPoint = currentPoint * this.slotManager.getEmptySlotCount();
        let currentActiveBoxesPoint = this.calculateActiveBoxesColorPoint();
        log( 'currentActiveBoxesPoint', currentActiveBoxesPoint );

        this._targetPoint = this._targetPoint - currentActiveBoxesPoint;
        log( 'this._targetPoint truoc khi clamp', this._targetPoint );
        // Clamp [0, colorPoint của box gần nhất vừa tạo + 2]
        let upperBound = 0;
        const lastId = this.boxManager?.getLastSpawnedBoxId ? this.boxManager.getLastSpawnedBoxId() : -1;
        if ( lastId >= 0 && this._colorPoints.has( lastId ) )
        {
            upperBound = this._colorPoints.get( lastId );
        }
        log( 'upperBound', upperBound );
        this._targetPoint = Math.max( 0, Math.min( this._targetPoint, upperBound + 2 ) );
        log( 'this._targetPoint sau khi clamp', this._targetPoint );
    }
    //#endregion

    //#region evaluateDiffCurve
    /**
     * Trả về giá trị theo dạng bậc thang: lấy y tại mốc progress gần nhất bên trái (<= progress).
     */
    public evaluateDiffCurve ( progress: number ): number
    {
        if ( !this.diffCurvePoints || this.diffCurvePoints.length === 0 )
            return 0;
        const sorted = [ ...this.diffCurvePoints ].sort( ( a, b ) => a.x - b.x );
        let value = sorted[ 0 ].y;
        for ( let i = 0; i < sorted.length; i++ )
        {
            if ( progress >= sorted[ i ].x )
            {
                value = sorted[ i ].y;
            }
            else
            {
                break;
            }
        }
        return value;
    }
    //#endregion

    //#region getColorPoints
    public getColorPoints (): Map<number, number>
    {
        return this._colorPoints;
    }
    //#endregion

    //#region setNearMissCount
    public setNearMissCount ( count: number ): void
    {
        this._nearMissCount = Math.max( 0, count );
    }
    //#endregion

    //#region findNearestColorPointId
    /**
     * Tìm itemID có colorPoint gần với targetPoint.
     * Ưu tiên: không nằm trong box active VÀ không nằm trong FreeSlot, và point <= targetPoint; sau đó xét khoảng cách.
     */
    public findNearestColorPointId (): number
    {
        if ( isNaN( this._targetPoint ) )
            return -1;

        //const activeIds = this.getExcludedIds();
        const activeIds = new Set<number>();

        const boxes = this.boxManager?.getBoxesActive ? this.boxManager.getBoxesActive() : [];
        boxes.forEach( box =>
        {
            if ( box && box.getId )
                activeIds.add( box.getId() );
        } );

        let bestId = -1;
        let bestActiveRank = 2; // 0: not active, 1: active, 2: unknown
        let bestBelowRank = 2;  // 0: below/eq target, 1: above, 2: unknown
        let bestDiff = Number.POSITIVE_INFINITY;

        this._colorPoints.forEach( ( point, id ) =>
        {
            const isActive = activeIds.has( id );
            const activeRank = isActive ? 1 : 0;
            const belowRank = point <= this._targetPoint ? 0 : 1;
            const diff = Math.abs( point - this._targetPoint );


            const isBetterActive = activeRank < bestActiveRank;
            const isBetterBelow = belowRank < bestBelowRank;
            const isBetterDiff = diff < bestDiff;

            if (
                isBetterActive ||
                ( activeRank === bestActiveRank && ( isBetterBelow || ( belowRank === bestBelowRank && isBetterDiff ) ) )
            )
            {
                bestId = id;
                bestActiveRank = activeRank;
                bestBelowRank = belowRank;
                bestDiff = diff;

            }
        } );

        return bestId;
    }
    //#endregion

    //#region tryUseNearMiss
    /**
     * Nếu còn near miss và chỉ còn 1 slot trống, chọn 1 id có colorPoint = 0.
     * Ưu tiên id chưa active VÀ không nằm trong FreeSlot. Trả về id nếu tìm thấy, -1 nếu không dùng.
     */
    public tryUseNearMiss (): number
    {
        if ( this._nearMissCount <= 0 || !this.slotManager )
            return -1;

        const emptySlots = this.slotManager.getEmptySlotCount ? this.slotManager.getEmptySlotCount() : 0;
        if ( emptySlots !== 1 )
            return -1;

        //const activeIds = this.getExcludedIds();
        const activeIds = new Set<number>();

        let candidate = -1;
        let fallback = -1;
        this._colorPoints.forEach( ( point, id ) =>
        {
            if ( point !== 0 )
                return;
            if ( !activeIds.has( id ) && candidate === -1 )
                candidate = id;
            if ( fallback === -1 )
                fallback = id;
        } );

        const chosen = candidate !== -1 ? candidate : fallback;
        if ( chosen !== -1 )
        {
            this._nearMissCount--;
            return chosen;
        }
        return -1;
    }
    //#endregion

    //#region debugShow
    /**
     * Hiển thị thông tin targetPoint, point hiện tại trên diffCurve và colorPoints từng id.
     */
    public debugShow (): void
    {
        if ( !LevelLoader.Instance || !this.slotManager )
            return;

        const progress = LevelLoader.Instance.getProgressByItemPicked();
        const diffPoint = this.evaluateDiffCurve( progress );
        const targetPoint = this._targetPoint;
        const progressItemPicked = LevelLoader.Instance.getProgressByItemPicked
            ? LevelLoader.Instance.getProgressByItemPicked()
            : 0;
        let activeBoxesText = '';
        const activeBoxes = this.boxManager?.getBoxesActive ? this.boxManager.getBoxesActive() : [];
        activeBoxes.forEach( box =>
        {
            if ( box && box.getId )
            {
                const id = box.getId();
                const val = this._colorPoints.get( id ) || 0;
                activeBoxesText += `boxId ${ id }: ${ val }\n`;
            }
        } );

        let colorPointsText = '';
        this._colorPoints.forEach( ( val, id ) =>
        {
            colorPointsText += `id ${ id }: ${ val }\n`;
        } );

        const text =
            `Progress: ${ progress }\n` +
            `DiffPoint: ${ diffPoint }\n` +
            `TargetPoint: ${ targetPoint }\n` +
            `ActiveBoxes:\n${ activeBoxesText }` +
            `ColorPoints:\n${ colorPointsText }`;

        if ( this.debugLabel )
        {
            this.debugLabel.string = text;
        }
        else
        {
            console.log( '[DifficultCurve]', text );
        }
    }
    //#endregion
}
