# Hướng Dẫn Setup Event Tracking

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc TrackingManager](#cấu-trúc-trackingmanager)
3. [Danh Sách Event Types](#danh-sách-event-types)
4. [Chi Tiết Từng Event và Cách Setup](#chi-tiết-từng-event-và-cách-setup)
5. [Ví Dụ Code](#ví-dụ-code)
6. [Best Practices](#best-practices)

---

## Tổng Quan

Hệ thống Event Tracking trong project sử dụng `TrackingManager` để gửi các sự kiện đến hệ thống analytics bên ngoài thông qua `window.ALPlayableAnalytics.trackEvent()`.

### File Chính
- **TrackingManager**: `assets/base-script/PlayableAds/Tracking/TrackingManager.ts`
- **EventType Enum**: Định nghĩa tất cả các loại event có thể track

---

## Cấu Trúc TrackingManager

### Import TrackingManager

```typescript
import { TrackingManager, EventType } from '../../base-script/PlayableAds/Tracking/TrackingManager';
// hoặc
import { TrackingManager, EventType } from 'db://assets/base-script/PlayableAds/Tracking/TrackingManager';
```

### Cách Sử Dụng

```typescript
// Gọi tracking event
TrackingManager.TrackEvent(EventType.EVENT_NAME);
```

**Lưu ý**: `TrackingManager.TrackEvent()` sẽ tự động kiểm tra xem `window.ALPlayableAnalytics` có tồn tại hay không trước khi gọi. Nếu không tồn tại, event sẽ không được gửi (không gây lỗi).

---

## Danh Sách Event Types

| Event Type | Mô Tả | Trạng Thái |
|------------|-------|------------|
| `LOADING` | Game đang load | ✅ Đã implement |
| `LOADED` | Game đã load xong | ✅ Đã implement |
| `DISPLAYED` | Game đã hiển thị | ✅ Đã implement |
| `CHALLENGE_STARTED` | Người chơi bắt đầu chơi | ✅ Đã implement |
| `CHALLENGE_FAILED` | Người chơi thua | ✅ Đã implement |
| `CHALLENGE_RETRY` | Người chơi chơi lại | ⚠️ Chưa implement |
| `CHALLENGE_PASS_25` | Hoàn thành 25% game | ✅ Đã implement |
| `CHALLENGE_PASS_50` | Hoàn thành 50% game | ✅ Đã implement |
| `CHALLENGE_PASS_75` | Hoàn thành 75% game | ✅ Đã implement |
| `CHALLENGE_SOLVED` | Người chơi thắng | ✅ Đã implement |
| `COMPLETED` | Game hoàn thành | ✅ Đã implement |
| `CTA_CLICKED` | Click vào nút CTA (Call To Action) | ✅ Đã implement |
| `ENDCARD_SHOWN` | Màn hình kết thúc hiển thị | ✅ Đã implement |

---

## Chi Tiết Từng Event và Cách Setup

### 1. LOADING ✅
**Mô tả**: Track khi game bắt đầu quá trình load (load assets, resources, etc.)

**Khi nào track**: 
- Khi game bắt đầu load assets
- Trong `GameManager.start()` khi game khởi động

**Vị trí hiện tại**: 
```58:58:assets/Scripts/Core/GameManager.ts
TrackingManager.TrackEvent(EventType.LOADING);
```

**Đã implement**: ✅ Trong `GameManager.start()` - gọi ngay khi game bắt đầu

**Lưu ý**: Event này được track trước khi set state `INITIALIZATION`

---

### 2. LOADED ✅
**Mô tả**: Track khi game đã load xong tất cả assets và sẵn sàng chơi

**Khi nào track**: 
- Sau khi tất cả assets đã load xong
- Sau khi set state `INITIALIZATION`

**Vị trí hiện tại**:
```60:60:assets/Scripts/Core/GameManager.ts
TrackingManager.TrackEvent(EventType.LOADED);
```

**Đã implement**: ✅ Trong `GameManager.start()` - gọi sau khi set state `INITIALIZATION`

**Lưu ý**: Event này được track ngay sau `LOADING` và sau khi set state

---

### 3. DISPLAYED ✅
**Mô tả**: Track khi game đã hiển thị trên màn hình và người chơi có thể tương tác

**Khi nào track**: 
- Sau khi UI chính đã render xong
- Khi game sẵn sàng nhận input từ người chơi

**Vị trí hiện tại**:
```61:61:assets/Scripts/Core/GameManager.ts
TrackingManager.TrackEvent(EventType.DISPLAYED);
```

**Đã implement**: ✅ Trong `GameManager.start()` - gọi sau `LOADED`

**Lưu ý**: Event này được track ngay sau `LOADED` để đánh dấu game đã sẵn sàng hiển thị

---

### 4. CHALLENGE_STARTED ✅
**Mô tả**: Track khi người chơi bắt đầu chơi (bắt đầu level)

**Khi nào track**: 
- Khi game state chuyển sang `START`
- Người chơi bắt đầu tương tác với game

**Vị trí hiện tại**: 
```12:10:assets/Scripts/Base/State/GameState/GameStart.ts
TrackingManager.TrackEvent(EventType.CHALLENGE_STARTED);
```

**Đã implement**: ✅ Trong `GameStart.enterState()`

---

### 5. CHALLENGE_FAILED ✅
**Mô tả**: Track khi người chơi thua game

**Khi nào track**: 
- Khi game state chuyển sang `LOSE`
- Khi slot đầy và không thể thêm goods

**Vị trí hiện tại**: 
```15:15:assets/Scripts/Base/State/GameState/GameLose.ts
TrackingManager.TrackEvent(EventType.CHALLENGE_FAILED);
```

**Đã implement**: ✅ Trong `GameLose.enterState()`

---

### 6. CHALLENGE_RETRY
**Mô tả**: Track khi người chơi chơi lại sau khi thua

**Khi nào track**: 
- Khi người chơi click nút "Retry" hoặc "Play Again"
- Khi game restart từ màn hình Lose

**Vị trí đề xuất**:
```typescript
// Trong LosePage khi click nút retry
// hoặc trong GameManager khi restart game
TrackingManager.TrackEvent(EventType.CHALLENGE_RETRY);
```

**Ví dụ implementation**:
```typescript
// Trong LosePage.ts hoặc nơi xử lý retry
public onRetryClick(): void {
    TrackingManager.TrackEvent(EventType.CHALLENGE_RETRY);
    // Logic restart game
    GameManager.Instance.restart();
}
```

---

### 7. CHALLENGE_PASS_25 ✅
**Mô tả**: Track khi người chơi hoàn thành 25% tiến độ game

**Khi nào track**: 
- Tự động tính dựa trên số box đã hoàn thành / tổng số box
- Khi progress >= 25% và chưa từng track mốc này

**Vị trí hiện tại**: 
```297:299:assets/Scripts/Core/BoxManager.ts
if (progress >= 25 && !this._trackedProgress.has(25)) {
    TrackingManager.TrackEvent(EventType.CHALLENGE_PASS_25);
    this._trackedProgress.add(25);
}
```

**Đã implement**: ✅ Tự động trong `BoxManager.trackProgress()`

**Cách hoạt động**:
- `BoxManager` tự động tính tổng số box từ level data
- Mỗi khi box hoàn thành, gọi `trackProgress()` để kiểm tra và track các mốc

---

### 8. CHALLENGE_PASS_50 ✅
**Mô tả**: Track khi người chơi hoàn thành 50% tiến độ game

**Khi nào track**: 
- Tự động tính dựa trên số box đã hoàn thành / tổng số box
- Khi progress >= 50% và chưa từng track mốc này

**Vị trí hiện tại**: 
```302:305:assets/Scripts/Core/BoxManager.ts
if (progress >= 50 && !this._trackedProgress.has(50)) {
    TrackingManager.TrackEvent(EventType.CHALLENGE_PASS_50);
    this._trackedProgress.add(50);
}
```

**Đã implement**: ✅ Tự động trong `BoxManager.trackProgress()`

---

### 9. CHALLENGE_PASS_75 ✅
**Mô tả**: Track khi người chơi hoàn thành 75% tiến độ game

**Khi nào track**: 
- Tự động tính dựa trên số box đã hoàn thành / tổng số box
- Khi progress >= 75% và chưa từng track mốc này

**Vị trí hiện tại**: 
```308:311:assets/Scripts/Core/BoxManager.ts
if (progress >= 75 && !this._trackedProgress.has(75)) {
    TrackingManager.TrackEvent(EventType.CHALLENGE_PASS_75);
    this._trackedProgress.add(75);
}
```

**Đã implement**: ✅ Tự động trong `BoxManager.trackProgress()`

---

### 10. CHALLENGE_SOLVED ✅
**Mô tả**: Track khi người chơi thắng game (hoàn thành level)

**Khi nào track**: 
- Khi game state chuyển sang `WIN`
- Khi tất cả box đã được hoàn thành

**Vị trí hiện tại**: 
```16:16:assets/Scripts/Base/State/GameState/GameWin.ts
TrackingManager.TrackEvent(EventType.CHALLENGE_SOLVED);
```

**Đã implement**: ✅ Trong `GameWin.enterState()`

---

### 11. COMPLETED ✅
**Mô tả**: Track khi game hoàn thành (thường đi kèm với CHALLENGE_SOLVED)

**Khi nào track**: 
- Khi game state chuyển sang `WIN`
- Sau khi CHALLENGE_SOLVED

**Vị trí hiện tại**: 
```17:17:assets/Scripts/Base/State/GameState/GameWin.ts
TrackingManager.TrackEvent(EventType.COMPLETED);
```

**Đã implement**: ✅ Trong `GameWin.enterState()`

---

### 12. CTA_CLICKED ✅
**Mô tả**: Track khi người chơi click vào nút CTA (Call To Action) - nút mở store

**Khi nào track**: 
- Khi người chơi click nút "Download" hoặc "Install"
- Khi mở store (cả click thủ công và tự động)

**Vị trí hiện tại**: 
```107:107:assets/base-script/PlayableAds/PlayableAdsManager.ts
TrackingManager.TrackEvent(EventType.CTA_CLICKED);
```

**Đã implement**: ✅ Trong `PlayableAdsManager.openStore()` và `forceOpenStore()`

---

### 13. ENDCARD_SHOWN ✅
**Mô tả**: Track khi màn hình kết thúc (Win hoặc Lose) được hiển thị

**Khi nào track**: 
- Sau khi màn hình Win/Lose hiển thị (có delay để đảm bảo UI đã render)
- Thường track sau 2 giây sau khi vào state Win/Lose

**Vị trí hiện tại**: 
```19:19:assets/Scripts/Base/State/GameState/GameWin.ts
TrackingManager.TrackEvent(EventType.ENDCARD_SHOWN);
```

```17:17:assets/Scripts/Base/State/GameState/GameLose.ts
TrackingManager.TrackEvent(EventType.ENDCARD_SHOWN);
```

**Đã implement**: ✅ Trong `GameWin.enterState()` và `GameLose.enterState()` với delay 2 giây

---

## Ví Dụ Code

### Ví Dụ 1: Track Event Đơn Giản

```typescript
import { TrackingManager, EventType } from '../../base-script/PlayableAds/Tracking/TrackingManager';

// Track khi người chơi click vào button
public onButtonClick(): void {
    TrackingManager.TrackEvent(EventType.CTA_CLICKED);
}
```

### Ví Dụ 2: Track Event với Điều Kiện

```typescript
import { TrackingManager, EventType } from '../../base-script/PlayableAds/Tracking/TrackingManager';

// Track retry chỉ khi người chơi đã thua
public onRetryClick(): void {
    if (this.hasFailed) {
        TrackingManager.TrackEvent(EventType.CHALLENGE_RETRY);
    }
    this.restartGame();
}
```

### Ví Dụ 3: Track Event với Delay

```typescript
import { TrackingManager, EventType } from '../../base-script/PlayableAds/Tracking/TrackingManager';

// Track sau khi UI đã render xong
public showEndScreen(): void {
    this.scheduleOnce(() => {
        TrackingManager.TrackEvent(EventType.ENDCARD_SHOWN);
    }, 2); // Delay 2 giây
}
```

### Ví Dụ 4: Track Progress Events (Đã tự động trong BoxManager)

```typescript
// Không cần implement thủ công
// BoxManager tự động track CHALLENGE_PASS_25, 50, 75 khi box hoàn thành

// Nếu muốn track progress theo cách khác:
private trackCustomProgress(progress: number): void {
    if (progress >= 25 && !this._tracked25) {
        TrackingManager.TrackEvent(EventType.CHALLENGE_PASS_25);
        this._tracked25 = true;
    }
    // Tương tự cho 50% và 75%
}
```

---

## Best Practices

### 1. **Luôn Import EventType từ TrackingManager**
```typescript
// ✅ Đúng
import { TrackingManager, EventType } from '../../base-script/PlayableAds/Tracking/TrackingManager';
TrackingManager.TrackEvent(EventType.CHALLENGE_STARTED);

// ❌ Sai - không dùng string trực tiếp
TrackingManager.TrackEvent('CHALLENGE_STARTED');
```

### 2. **Track Event Đúng Thời Điểm**
- Track `CHALLENGE_STARTED` khi game thực sự bắt đầu, không phải khi load
- Track `ENDCARD_SHOWN` sau khi UI đã render xong (dùng delay)
- Track progress events chỉ một lần cho mỗi mốc

### 3. **Tránh Track Trùng Lặp**
- Sử dụng flag hoặc Set để đảm bảo mỗi event chỉ track một lần
- Ví dụ: `BoxManager` sử dụng `_trackedProgress` Set để tránh track trùng

### 4. **Xử Lý Lỗi An Toàn**
- `TrackingManager.TrackEvent()` đã tự động kiểm tra `window.ALPlayableAnalytics` tồn tại
- Không cần try-catch, nhưng có thể thêm log để debug

### 5. **Thứ Tự Track Events**
Thứ tự đề xuất khi game kết thúc:
1. `CHALLENGE_SOLVED` hoặc `CHALLENGE_FAILED`
2. `COMPLETED` (nếu win)
3. Delay 2 giây
4. `ENDCARD_SHOWN`
5. `CTA_CLICKED` (khi click vào store)

### 6. **Debug Tracking**
Để debug, có thể thêm console.log trước khi track:
```typescript
if (this.logDebug) {
    console.log('Tracking event:', EventType.CHALLENGE_STARTED);
}
TrackingManager.TrackEvent(EventType.CHALLENGE_STARTED);
```

---

## Checklist Setup Event Tracking

### Events Đã Implement ✅
- [x] `LOADING` - Trong `GameManager.start()` (dòng 58)
- [x] `LOADED` - Trong `GameManager.start()` (dòng 60)
- [x] `DISPLAYED` - Trong `GameManager.start()` (dòng 61)
- [x] `CHALLENGE_STARTED` - Trong `GameStart.enterState()`
- [x] `CHALLENGE_FAILED` - Trong `GameLose.enterState()`
- [x] `CHALLENGE_PASS_25` - Tự động trong `BoxManager.trackProgress()`
- [x] `CHALLENGE_PASS_50` - Tự động trong `BoxManager.trackProgress()`
- [x] `CHALLENGE_PASS_75` - Tự động trong `BoxManager.trackProgress()`
- [x] `CHALLENGE_SOLVED` - Trong `GameWin.enterState()`
- [x] `COMPLETED` - Trong `GameWin.enterState()`
- [x] `CTA_CLICKED` - Trong `PlayableAdsManager.openStore()` và `forceOpenStore()`
- [x] `ENDCARD_SHOWN` - Trong `GameWin.enterState()` và `GameLose.enterState()`

### Events Cần Implement ⚠️
- [ ] `CHALLENGE_RETRY` - Cần thêm trong nút retry của `LosePage` hoặc khi restart game

---

## Lưu Ý Quan Trọng

1. **TrackingManager hoạt động độc lập**: Không cần khởi tạo instance, chỉ cần gọi static method
2. **Tự động kiểm tra**: Method tự động kiểm tra `window.ALPlayableAnalytics` tồn tại trước khi gọi
3. **Không gây lỗi**: Nếu analytics không có sẵn, event sẽ không được gửi nhưng không gây crash
4. **Progress tracking tự động**: `BoxManager` tự động tính và track progress, không cần can thiệp thủ công

---

## ⚠️ Lưu Ý Về Việc Xóa Event Tracking Cũ

Khi refactor hoặc thay đổi logic tracking, cần lưu ý:

### 1. **Kiểm Tra Trước Khi Xóa**
- Đảm bảo event không còn được sử dụng ở nơi khác trong codebase
- Sử dụng `grep` hoặc search để tìm tất cả vị trí sử dụng event đó

### 2. **Xóa Event Tracking Cũ**
Nếu một event không còn cần thiết:

**Bước 1**: Xóa tất cả các lời gọi `TrackingManager.TrackEvent()` của event đó
```typescript
// ❌ Xóa dòng này nếu không còn cần
TrackingManager.TrackEvent(EventType.OLD_EVENT);
```

**Bước 2**: Xóa event khỏi `EventType` enum trong `TrackingManager.ts`
```typescript
export enum EventType {
    // ❌ Xóa dòng này
    OLD_EVENT = 'OLD_EVENT',
    // ... các event khác
}
```

**Bước 3**: Cập nhật documentation (file này) để phản ánh thay đổi

### 3. **Các Trường Hợp Cần Xóa Event**
- Event không còn được sử dụng trong game flow
- Event bị thay thế bởi event khác
- Event không còn yêu cầu từ phía analytics

### 4. **Best Practice Khi Xóa**
```typescript
// ✅ Đúng: Xóa hoàn toàn event và tất cả references
// 1. Xóa khỏi enum
// 2. Xóa tất cả TrackingManager.TrackEvent(EventType.OLD_EVENT)
// 3. Cập nhật documentation

// ❌ Sai: Chỉ comment code mà không xóa
// TrackingManager.TrackEvent(EventType.OLD_EVENT); // TODO: Remove later
```

### 5. **Kiểm Tra Sau Khi Xóa**
Sau khi xóa event, cần:
- Build và test game để đảm bảo không có lỗi
- Kiểm tra console không có warning về event không tồn tại
- Cập nhật file hướng dẫn này

### 6. **Ví Dụ Xóa Event**
```typescript
// TRƯỚC KHI XÓA:
// TrackingManager.ts
export enum EventType {
    OLD_EVENT = 'OLD_EVENT',  // ← Cần xóa
    NEW_EVENT = 'NEW_EVENT',
}

// GameManager.ts
TrackingManager.TrackEvent(EventType.OLD_EVENT); // ← Cần xóa

// SAU KHI XÓA:
// TrackingManager.ts
export enum EventType {
    NEW_EVENT = 'NEW_EVENT',
}

// GameManager.ts
// (đã xóa dòng track OLD_EVENT)
```

---

## Tài Liệu Tham Khảo

- **TrackingManager**: `assets/base-script/PlayableAds/Tracking/TrackingManager.ts`
- **BoxManager**: `assets/Scripts/Core/BoxManager.ts` (progress tracking)
- **Game States**: `assets/Scripts/Base/State/GameState/`
- **PlayableAdsManager**: `assets/base-script/PlayableAds/PlayableAdsManager.ts`

---

## Thứ Tự Track Events Trong Game Flow

### Khi Game Khởi Động
1. `LOADING` - Khi `GameManager.start()` được gọi
2. Set state `INITIALIZATION`
3. `LOADED` - Sau khi set state
4. `DISPLAYED` - Sau khi `LOADED`

### Khi Game Bắt Đầu
5. `CHALLENGE_STARTED` - Khi vào state `START`

### Trong Quá Trình Chơi
6. `CHALLENGE_PASS_25` - Tự động khi hoàn thành 25% box
7. `CHALLENGE_PASS_50` - Tự động khi hoàn thành 50% box
8. `CHALLENGE_PASS_75` - Tự động khi hoàn thành 75% box

### Khi Game Kết Thúc (Win)
9. `CHALLENGE_SOLVED` - Khi vào state `WIN`
10. `COMPLETED` - Ngay sau `CHALLENGE_SOLVED`
11. Delay 2 giây
12. `ENDCARD_SHOWN` - Sau khi UI Win render xong
13. `CTA_CLICKED` - Khi click hoặc tự động mở store

### Khi Game Kết Thúc (Lose)
9. `CHALLENGE_FAILED` - Khi vào state `LOSE`
10. Delay 2 giây
11. `ENDCARD_SHOWN` - Sau khi UI Lose render xong
12. `CTA_CLICKED` - Khi click hoặc tự động mở store

---

**Cập nhật lần cuối**: Dựa trên codebase hiện tại (đã cập nhật với LOADING, LOADED, DISPLAYED)
**Phiên bản**: 1.1

