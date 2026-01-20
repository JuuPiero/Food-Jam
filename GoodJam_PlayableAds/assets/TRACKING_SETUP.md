# Hướng dẫn Setup TrackingManager

## Tổng quan

`TrackingManager` là component quản lý việc tracking các sự kiện trong game để gửi về hệ thống analytics của playable ads. Component này sử dụng API `window.ALPlayableAnalytics` từ HTML wrapper để gửi các event tracking.

## Cấu trúc File

File TrackingManager nằm tại: `assets/base-script/PlayableAds/Tracking/TrackingManager.ts`

## Các Event Type

`TrackingManager` hỗ trợ các loại event sau (được định nghĩa trong enum `EventType`):

### 1. Event Lifecycle
- **LOADING**: Game đang load
- **LOADED**: Game đã load xong
- **DISPLAYED**: Game đã hiển thị trên màn hình

### 2. Event Gameplay
- **CHALLENGE_STARTED**: Người chơi bắt đầu chơi
- **CHALLENGE_FAILED**: Người chơi thua
- **CHALLENGE_RETRY**: Người chơi chơi lại (chưa được implement)
- **CHALLENGE_SOLVED**: Người chơi hoàn thành thử thách
- **COMPLETED**: Game đã hoàn thành

### 3. Event Progress Milestones
- **CHALLENGE_PASS_25**: Hoàn thành 25% mục tiêu
- **CHALLENGE_PASS_50**: Hoàn thành 50% mục tiêu
- **CHALLENGE_PASS_75**: Hoàn thành 75% mục tiêu

### 4. Event UI/Interaction
- **CTA_CLICKED**: Người chơi click vào nút CTA (Call To Action)
- **ENDCARD_SHOWN**: Màn hình kết thúc đã hiển thị

## Cách Setup

### Bước 1: Đảm bảo HTML Wrapper có ALPlayableAnalytics

TrackingManager yêu cầu object `window.ALPlayableAnalytics` phải được định nghĩa trong HTML wrapper. Object này phải có method `trackEvent(eventName: string)`.

**Ví dụ HTML wrapper:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Playable Ads</title>
    <script>
        // Định nghĩa ALPlayableAnalytics trước khi game load
        window.ALPlayableAnalytics = {
            trackEvent: function(eventName) {
                // Gửi event đến hệ thống tracking
                console.log('Track Event:', eventName);
                // Implement logic gửi event đến server tracking của bạn
                // Ví dụ: fetch('/track', { method: 'POST', body: JSON.stringify({event: eventName}) });
            }
        };
    </script>
</head>
<body>
    <!-- Canvas của Cocos Creator sẽ được inject vào đây -->
</body>
</html>
```

### Bước 2: Import TrackingManager trong code

TrackingManager là một static class, không cần khởi tạo instance. Chỉ cần import và sử dụng trực tiếp:

```typescript
import { EventType, TrackingManager } from '../../base-script/PlayableAds/Tracking/TrackingManager';
```

### Bước 3: Sử dụng TrackingManager.TrackEvent()

Gọi method static `TrackEvent()` với event name từ enum `EventType`:

```typescript
TrackingManager.TrackEvent(EventType.LOADING);
TrackingManager.TrackEvent(EventType.CHALLENGE_STARTED);
```

## Các Vị Trí Tracking Đã Được Implement

### 1. GameManager.ts - Lifecycle Events

```typescript
protected start(): void {
    TrackingManager.TrackEvent(EventType.LOADING);
    this.State = EGameState.INITIALIZATION;
    TrackingManager.TrackEvent(EventType.LOADED);
    TrackingManager.TrackEvent(EventType.DISPLAYED);
}
```

**Vị trí:** `assets/Scripts/Core/GameManager.ts` (dòng 57-61)

### 2. GameStart.ts - Challenge Started

```typescript
public enterState(): void {
    TrackingManager.TrackEvent(EventType.CHALLENGE_STARTED);
    // ...
}
```

**Vị trí:** `assets/Scripts/Base/State/GameState/GameStart.ts` (dòng 11)

### 3. BoxManager.ts - Progress Milestones

```typescript
private trackProgressMilestones(): void {
    if (this._totalBoxesToWin <= 0) {
        return;
    }
    const progress = this._completedBoxes / this._totalBoxesToWin;
    PROGRESS_MILESTONES.forEach(milestone => {
        if (progress >= milestone.threshold && !this._triggeredMilestones.has(milestone.event)) {
            this._triggeredMilestones.add(milestone.event);
            TrackingManager.TrackEvent(milestone.event);
        }
    });
}
```

**Vị trí:** `assets/Scripts/Core/BoxManager.ts` (dòng 276-287)

**Các milestone được định nghĩa:**
- 25%: `CHALLENGE_PASS_25`
- 50%: `CHALLENGE_PASS_50`
- 75%: `CHALLENGE_PASS_75`

### 4. GameWin.ts - Win Events

```typescript
public enterState(): void {
    TrackingManager.TrackEvent(EventType.CHALLENGE_SOLVED);
    TrackingManager.TrackEvent(EventType.COMPLETED);
    
    this._gameManager.scheduleOnce(() => {
        TrackingManager.TrackEvent(EventType.ENDCARD_SHOWN);
        // ...
    }, 2);
}
```

**Vị trí:** `assets/Scripts/Base/State/GameState/GameWin.ts` (dòng 16-20)

### 5. GameLose.ts - Lose Events

```typescript
public enterState(): void {
    TrackingManager.TrackEvent(EventType.CHALLENGE_FAILED);
    this._gameManager.scheduleOnce(() => {
        TrackingManager.TrackEvent(EventType.ENDCARD_SHOWN);
        // ...
    }, 2);
}
```

**Vị trí:** `assets/Scripts/Base/State/GameState/GameLose.ts` (dòng 15-17)

### 6. PlayableAdsManager.ts - CTA Clicked

```typescript
public openStore(): void {
    TrackingManager.TrackEvent(EventType.CTA_CLICKED);
    super_html_playable.download();
    super_html_playable.game_end();
}

public forceOpenStore(): void {
    TrackingManager.TrackEvent(EventType.CTA_CLICKED);
    super_html_playable.download();
    super_html_playable.game_end();
}
```

**Vị trí:** `assets/base-script/PlayableAds/PlayableAdsManager.ts` (dòng 111, 119)

## Cách Thêm Tracking Mới

### Ví dụ: Track khi người chơi click vào một button

1. **Import TrackingManager:**

```typescript
import { EventType, TrackingManager } from '../../base-script/PlayableAds/Tracking/TrackingManager';
```

2. **Gọi TrackEvent tại vị trí cần track:**

```typescript
onButtonClick(): void {
    TrackingManager.TrackEvent(EventType.CTA_CLICKED);
    // Logic xử lý click
}
```

### Ví dụ: Track custom event (nếu cần mở rộng)

Nếu cần track event không có trong enum, bạn có thể:

1. **Thêm event mới vào enum EventType:**

```typescript
export enum EventType {
    // ... các event hiện có
    CUSTOM_EVENT = 'CUSTOM_EVENT',
}
```

2. **Sử dụng event mới:**

```typescript
TrackingManager.TrackEvent(EventType.CUSTOM_EVENT);
```

Hoặc có thể truyền trực tiếp string (không khuyến khích):

```typescript
TrackingManager.TrackEvent('CUSTOM_EVENT_NAME');
```

## Lưu Ý Quan Trọng

### 1. Kiểm tra ALPlayableAnalytics tồn tại

TrackingManager tự động kiểm tra `window.ALPlayableAnalytics` trước khi gọi. Nếu không tồn tại, method sẽ không làm gì (fail-safe). Điều này giúp game vẫn chạy được trong môi trường development không có HTML wrapper.

```typescript
static TrackEvent(nameEvent : string){
    //@ts-ignore
    if (typeof window.ALPlayableAnalytics != 'undefined') {
        //@ts-ignore
        window.ALPlayableAnalytics.trackEvent(nameEvent);
    }
}
```

### 2. TypeScript @ts-ignore

Code sử dụng `@ts-ignore` vì `window.ALPlayableAnalytics` là object được inject từ HTML wrapper, không có trong type definition của TypeScript.

### 3. Event không được track nhiều lần

Một số event như progress milestones sử dụng `Set` để đảm bảo chỉ track một lần:

```typescript
private _triggeredMilestones: Set<EventType> = new Set<EventType>();
```

### 4. Timing của Events

Một số event được track với delay để đảm bảo UI đã render xong:

```typescript
// Track ENDCARD_SHOWN sau 2 giây để đảm bảo UI đã hiển thị
this._gameManager.scheduleOnce(() => {
    TrackingManager.TrackEvent(EventType.ENDCARD_SHOWN);
}, 2);
```

## Debugging

### Kiểm tra Tracking có hoạt động

1. **Mở Developer Console** trong browser
2. **Kiểm tra log** từ HTML wrapper (nếu có implement console.log trong trackEvent)
3. **Kiểm tra Network tab** để xem có request nào được gửi đến server tracking không

### Test trong Development

Trong môi trường development, bạn có thể thêm log vào HTML wrapper:

```javascript
window.ALPlayableAnalytics = {
    trackEvent: function(eventName) {
        console.log('[Tracking] Event:', eventName, new Date().toISOString());
        // Logic tracking thực tế
    }
};
```

## Troubleshooting

### Vấn đề: Events không được track

**Nguyên nhân có thể:**
1. `window.ALPlayableAnalytics` chưa được định nghĩa trong HTML wrapper
2. HTML wrapper load sau khi game đã chạy
3. Method `trackEvent` không tồn tại hoặc có lỗi

**Giải pháp:**
- Đảm bảo `window.ALPlayableAnalytics` được định nghĩa trước khi game load
- Kiểm tra console có lỗi JavaScript không
- Thêm try-catch trong HTML wrapper để bắt lỗi

### Vấn đề: Events bị track nhiều lần

**Nguyên nhân:**
- Logic không kiểm tra event đã được track chưa

**Giải pháp:**
- Sử dụng Set hoặc flag để đảm bảo event chỉ track một lần
- Xem ví dụ trong `BoxManager.trackProgressMilestones()`

## Tóm Tắt Checklist Setup

- [ ] HTML wrapper đã định nghĩa `window.ALPlayableAnalytics`
- [ ] Method `trackEvent` đã được implement trong HTML wrapper
- [ ] Đã import `TrackingManager` và `EventType` trong các file cần track
- [ ] Đã test tracking trong môi trường production (có HTML wrapper)
- [ ] Đã kiểm tra console không có lỗi
- [ ] Đã verify các event được gửi đúng đến server tracking

## Tài Liệu Tham Khảo

- File TrackingManager: `assets/base-script/PlayableAds/Tracking/TrackingManager.ts`
- File GameManager: `assets/Scripts/Core/GameManager.ts`
- File BoxManager: `assets/Scripts/Core/BoxManager.ts`
- File PlayableAdsManager: `assets/base-script/PlayableAds/PlayableAdsManager.ts`



