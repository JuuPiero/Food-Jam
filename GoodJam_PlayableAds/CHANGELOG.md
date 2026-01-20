# CHANGELOG

## 2026-01-20
- Gỡ toàn bộ usage của `TrackingManager` khỏi gameplay/playable shell (TouchEventListener, GameWin, GameLose, WinPage, LosePage, PlayableAdsManager); giữ nguyên file `assets/base-script/PlayableAds/Tracking/TrackingManager.ts`.
- Thêm tài liệu `ARCHITECTURE.md` mô tả cấu trúc và luồng chính.
- Triển khai tracking mới theo `assets/TRACKING_SETUP_GUIDE.md` và `assets/TRACKING_SETUP.md`: lifecycle (LOADING/LOADED/DISPLAYED), challenge start (CHALLENGE_STARTED), win/lose (CHALLENGE_SOLVED/CHALLENGE_FAILED/COMPLETED), endcard (ENDCARD_SHOWN), CTA (CTA_CLICKED), progress milestones (CHALLENGE_PASS_25/50/75).
