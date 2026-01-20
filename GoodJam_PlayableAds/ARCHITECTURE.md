## Kiến trúc tổng quan
- **Engine**: Cocos Creator (TypeScript), đích nhắm web/mobile playable.
- **assets/Scripts**: Gameplay chính.
  - `Core/`: vòng đời level, spawn box/goods (`GameManager`, `LevelLoader`, `BoxManager`, `SlotManager`, `TouchEventListener`...).
  - `Goods/`, `Shelf/`, `Box/`: mô hình hàng hóa, kệ, hộp; `Goods` kế thừa `GoodsBase`, tính `goodPoint`; `ShelfLayer` cung cấp danh sách goods; `Box` chứa goods.
  - `Base/State`: state machine cho win/lose, chuyển màn, mở store.
  - `UI/Screen`: các màn UI chính (Home, Win/Lose...).
- **assets/base-script**: Thư viện hỗ trợ playable ads (tracking, event bus, UI màn quảng cáo).
  - `PlayableAds/`: quản lý mở store, event, tracking (đã bỏ các call trong gameplay).
  - `UI/`: WinPage, LosePage dành cho playable shell.
- **assets/Datas**: JSON level data.
- **assets/Prefabs/Animation/Sounds/Graphics**: tài nguyên trình bày.

## Luồng chính
- `GameManager` khởi tạo level qua `LevelLoader`, setup tutorial, đếm thời gian, chuyển state.
- Người chơi chạm (`TouchEventListener`) → bật âm thanh, tắt tutorial, chuyển state PLAYING.
- `LevelLoader` dựng `Shelf`, `BoxManager`, tính progress; `BoxManager.fill()` spawn box theo dữ liệu hoặc hệ thống DifficultCurve.
- `Goods.pickUp()` cập nhật progress, tác động `BoxManager` và `Shelf`.
- State chuyển Win/Lose kích hoạt UI màn tương ứng; `PlayableAdsManager` xử lý mở store/CTA tùy trạng thái.

## Tích hợp playable ads
- `PlayableAdsManager` lắng nghe sự kiện click, mở store (`openStore/forceOpenStore`), đóng gói liên kết Google/App Store.
- Tracking runtime hiện còn trong `assets/base-script/PlayableAds/Tracking/TrackingManager.ts`; các điểm call trong gameplay đã được gỡ bỏ.

## Debug & khó khăn
- Hệ thống DifficultCurve (tài liệu kèm theo) điều chỉnh độ khó spawn box dựa trên progress và slot trống; cần `SlotManager`, `BoxManager`, `LevelLoader`.

## Phụ thuộc/cấu hình
- `tsconfig.json` cho TypeScript.
- `package.json` quản lý tooling (nếu cần build/linters).
