# Hướng Dẫn Setup Difficult Curve

## Tổng Quan

Difficult Curve là một hệ thống điều khiển độ khó của game thông qua việc tính toán điểm số (color points) cho từng loại item và chọn box spawn dựa trên target point. Hệ thống này thay thế logic spawn box ngẫu nhiên bằng một cơ chế thông minh hơn, đảm bảo độ khó game tăng dần theo tiến độ người chơi.

## Nguyên Lý Hoạt Động

### 1. Color Points
- **Định nghĩa**: Điểm số của mỗi itemID được tính dựa trên số lượng goods có thể nhìn thấy trên shelf
- **Cách tính**: 
  - Chỉ xét các goods trong 3 layer (tính từ `currentLayer` của mỗi shelf trở xuống)
  - Điểm của itemID = tổng 3 giá trị `goodPoint` thấp nhất của id đó (nếu < 3 goods thì cộng hết)
  - `goodPoint` của một goods = số lượng goods trong `referencedGoods` array

### 2. Target Point
- **Định nghĩa**: Điểm mục tiêu để chọn box spawn tiếp theo
- **Công thức**: 
  ```
  targetPoint = evaluateDiffCurve(progress) * emptySlotCount - currentActiveBoxesPoint
  ```
- **Clamp**: `[0, colorPoint của box gần nhất vừa tạo + 2]`

### 3. Difficulty Curve
- **Định nghĩa**: Mảng các điểm `Vec2` (x: progress, y: difficulty value)
- **Cách đánh giá**: Lấy giá trị y tại mốc progress gần nhất bên trái (<= progress) - dạng bậc thang

### 4. Near Miss
- **Điều kiện kích hoạt**: 
  - Còn near miss count (> 0)
  - Chỉ còn 1 slot trống
- **Hành vi**: Chọn 1 id có colorPoint = 0, ưu tiên id chưa active

## Cấu Trúc File

### File Chính: `DifficultCurve.ts`
Component quản lý toàn bộ logic của Difficult Curve.

**Properties:**
- `slotManager: SlotManager` - Quản lý slots
- `boxManager: BoxManager` - Quản lý boxes
- `debugLabel: Label` (optional) - Label để hiển thị debug info
- `diffCurvePoints: Vec2[]` - Mảng các điểm trên difficulty curve

**Methods chính:**
- `calculateColorPoints(shelves: Shelf[]): Map<number, number>` - Tính color points cho tất cả itemID
- `calculateAndStore()` - Tính và lưu color points vào instance
- `CalculateTargetPoint()` - Tính target point dựa trên progress và difficulty curve
- `findNearestColorPointId(): number` - Tìm itemID có colorPoint gần với targetPoint nhất
- `tryUseNearMiss(): number` - Thử dùng near miss nếu điều kiện thỏa mãn
- `evaluateDiffCurve(progress: number): number` - Đánh giá difficulty curve tại progress
- `debugShow()` - Hiển thị thông tin debug

## Các File Cần Chỉnh Sửa

### 1. BoxManager.ts

#### Thêm Property
```typescript
@property({
    type: CCBoolean
})
enableDifficultCurve: boolean = false;

private _lastSpawnedBoxId: number = -1;
```

#### Thêm Methods
```typescript
public setLastSpawnedBoxId(id: number): void {
    this._lastSpawnedBoxId = id;
}

public getLastSpawnedBoxId(): number {
    return this._lastSpawnedBoxId;
}
```

#### Chỉnh Sửa Method `fill()`
Thay thế logic spawn box trong vòng lặp:

**Trước khi spawn box:**
```typescript
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
```

**Sau khi initialize box:**
```typescript
if (this.enableDifficultCurve) {
    this.setLastSpawnedBoxId(id);
    // Calculate lại target point
    DifficultCurve.instance.CalculateTargetPoint();
    DifficultCurve.instance.debugShow();
}
```

**Lưu ý**: Tutorial box đầu tiên không bị ảnh hưởng, vẫn dùng `BoxDataFactory.getTutorialBoxData()`.

### 2. LevelLoader.ts

#### Thêm Import
```typescript
import { DifficultCurve } from './DifficultCurve';
```

#### Chỉnh Sửa Method `initialize()`
Thêm sau khi tạo xong shelves, trước khi `boxManager.initialize()`:
```typescript
// Tính điểm lần đầu
DifficultCurve.instance.calculateAndStore();

this.boxManager.initialize(data);
```

### 3. Goods.ts

#### Thêm Import
```typescript
import { DifficultCurve } from '../Core/DifficultCurve';
```

#### Chỉnh Sửa Method `pickUp()`
Thêm sau khi `this.shelf?.removeGoodsReference(this)`:
```typescript
// Tính lại color points + update diffPoint theo progress item picked
DifficultCurve.instance.calculateAndStore();
DifficultCurve.instance.CalculateTargetPoint();
DifficultCurve.instance.debugShow();
```

## Dependencies Cần Có

### 1. SlotManager
Cần có method:
```typescript
public getEmptySlotCount(): number {
    return this.freeSlots.filter(slot => !slot.isFull()).length;
}
```

### 2. BoxManager
Cần có methods:
```typescript
public getBoxesActive(): Box[]
public getLastSpawnedBoxId(): number
public setLastSpawnedBoxId(id: number): void
```

### 3. LevelLoader
Cần có methods:
```typescript
public getShelves(): Shelf[]
public getProgressByItemPicked(): number
public onItemPicked(): void
```

### 4. Goods
Cần có:
- Property `goodPoint: number` (getter trả về `referencedGoods.length`)
- Property `referencedGoods: GoodsBase[]`
- Method `getId(): number`
- Enum `EGoodsState` với giá trị `PICKED`

### 5. Shelf & ShelfLayer
Cần có:
- `Shelf.currentLayer: ShelfLayer`
- `Shelf.nodeLayers: Node` (chứa các layer nodes)
- `ShelfLayer.getGoods(): Goods[]`
- `Shelf.removeGoodsReference(goods: Goods): void`
- `Shelf.onGoodsPickUp(goods: Goods): void`

## Setup Trong Cocos Creator

### 1. Tạo Prefab DifficultCurve
1. Tạo một Node mới trong scene
2. Thêm component `DifficultCurve` vào node
3. Kéo thả các reference:
   - `SlotManager` component
   - `BoxManager` component
   - `Label` component (optional, cho debug)

### 2. Cấu Hình Difficulty Curve Points
Trong Inspector của `DifficultCurve` component:
- Thêm các điểm vào `diffCurvePoints` array
- Mỗi điểm là `Vec2` với:
  - `x`: Progress (0.0 - 1.0)
  - `y`: Difficulty value (số dương)

**Ví dụ:**
```
Point 0: (0.0, 1.0)   - Đầu game, difficulty = 1
Point 1: (0.25, 1.5)  - 25% progress, difficulty = 1.5
Point 2: (0.5, 2.0)   - 50% progress, difficulty = 2.0
Point 3: (0.75, 2.5)  - 75% progress, difficulty = 2.5
Point 4: (1.0, 3.0)   - Cuối game, difficulty = 3.0
```

### 3. Bật Difficult Curve
Trong Inspector của `BoxManager` component:
- Tích vào checkbox `Enable Difficult Curve`

### 4. Debug (Optional)
Nếu muốn xem debug info:
- Tạo một `Label` node
- Kéo thả vào `debugLabel` property của `DifficultCurve`
- Label sẽ hiển thị:
  - Progress hiện tại
  - DiffPoint từ curve
  - TargetPoint
  - ActiveBoxes với color points
  - Tất cả ColorPoints của các itemID

## Flow Hoạt Động

### 1. Khi Initialize Level
```
LevelLoader.initialize()
  └─> DifficultCurve.instance.calculateAndStore()
      └─> Tính color points cho tất cả itemID dựa trên goods hiện có
```

### 2. Khi Spawn Box Mới
```
BoxManager.fill()
  └─> DifficultCurve.instance.calculateAndStore()      // Tính lại color points
  └─> DifficultCurve.instance.CalculateTargetPoint()   // Tính target point
  └─> DifficultCurve.instance.tryUseNearMiss()         // Thử near miss
  └─> DifficultCurve.instance.findNearestColorPointId() // Tìm ID gần nhất
  └─> Box.initialize(id, total)
  └─> BoxManager.setLastSpawnedBoxId(id)
  └─> DifficultCurve.instance.CalculateTargetPoint()   // Tính lại sau khi spawn
  └─> DifficultCurve.instance.debugShow()               // Debug
```

### 3. Khi Pick Up Goods
```
Goods.pickUp()
  └─> Shelf.removeGoodsReference()
  └─> DifficultCurve.instance.calculateAndStore()      // Tính lại color points
  └─> DifficultCurve.instance.CalculateTargetPoint()   // Tính lại target point
  └─> DifficultCurve.instance.debugShow()               // Debug
```

## Tùy Chỉnh

### 1. Thay Đổi Số Layer Tính Color Points
Trong `DifficultCurve.ts`, thay đổi:
```typescript
private MAX_LAYER = 3; // Đổi thành số layer mong muốn
```

### 2. Thay Đổi Near Miss Count
Gọi method:
```typescript
DifficultCurve.instance.setNearMissCount(count);
```

### 3. Tùy Chỉnh Logic Chọn Box
Có thể chỉnh sửa method `findNearestColorPointId()` để thay đổi cách chọn box:
- Ưu tiên box không active
- Ưu tiên box có colorPoint <= targetPoint
- Chọn box có colorPoint gần targetPoint nhất

## Lưu Ý Quan Trọng

1. **Singleton Pattern**: `DifficultCurve` sử dụng singleton pattern qua `DifficultCurve.instance`. Đảm bảo chỉ có 1 instance trong scene.

2. **Tutorial Box**: Box tutorial đầu tiên không bị ảnh hưởng bởi Difficult Curve, vẫn dùng logic cũ với `BoxDataFactory.getTutorialBoxData()`.

3. **Performance**: Method `calculateColorPoints()` được gọi khá thường xuyên. Nếu có nhiều shelves và goods, cần tối ưu nếu cần thiết.

4. **Null Check**: Luôn kiểm tra `DifficultCurve.instance` trước khi sử dụng để tránh lỗi.

5. **Debug**: Nên bật debug label trong quá trình phát triển để theo dõi behavior của hệ thống.

## Troubleshooting

### Box không spawn đúng ID mong muốn
- Kiểm tra `diffCurvePoints` đã được setup đúng chưa
- Kiểm tra `enableDifficultCurve` đã được bật chưa
- Xem debug label để kiểm tra targetPoint và colorPoints

### Color Points không đúng
- Kiểm tra `goodPoint` của Goods có đúng không
- Kiểm tra `referencedGoods` có được set đúng không
- Kiểm tra `MAX_LAYER` có phù hợp không

### Target Point không hợp lý
- Kiểm tra `evaluateDiffCurve()` có trả về giá trị hợp lý không
- Kiểm tra `getEmptySlotCount()` có đúng không
- Kiểm tra clamp logic có đúng không

## Kết Luận

Difficult Curve là một hệ thống mạnh mẽ để điều khiển độ khó game một cách động. Bằng cách tính toán color points và target point, hệ thống có thể chọn box spawn một cách thông minh, đảm bảo trải nghiệm chơi game tốt hơn.

Để áp dụng vào dự án khác, chỉ cần:
1. Copy file `DifficultCurve.ts`
2. Chỉnh sửa các file theo hướng dẫn trên
3. Setup trong Cocos Creator như đã mô tả
4. Test và điều chỉnh `diffCurvePoints` cho phù hợp với game design

