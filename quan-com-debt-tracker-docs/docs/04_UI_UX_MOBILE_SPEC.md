# 04. UI/UX & Mobile-First Specifications

## 1. Design Principles & Ergonomics

- **Mobile-First & Touch Targets:** Every button and interactive control has a minimum touch target of **44px × 44px** (Apple Human Interface Guidelines / Material Design compliant), allowing comfortable single-finger tapping during busy food service hours.
- **One-Thumb Operability:** All critical operations (Quick Add, Search, Settle, Refresh) are clustered within natural thumb reach on 5.5" to 6.7" smartphone screens.
- **High-Contrast Currency Display:** Debt totals are styled in extra-bold typography with distinct red highlighting (`text-rose-600 font-black`) and Vietnamese dot separators (`70.000 đ`).
- **No Input Zoom:** All form fields enforce an explicit `font-size: 16px` to prevent iOS Safari auto-zoom annoyances upon focus.

---

## 2. Layout & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ 🍚 Sổ Ghi Nợ Quán Cơm   [🟢 Synced]  [田 Sheets] [🔄] [⚙️]  │ <- Sticky Header
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐ ┌─────────────────────┐ │
│ │ Tổng nợ quán  │ │ Khách nợ      │ │ Hôm nay             │ │ <- Summary Cards
│ │   105.000 đ   │ │    1 người    │ │   35.000 đ          │ │
│ └───────────────┘ └───────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 📝 Ghi Nợ Suất Cơm Mới                                      │ <- Quick Add Form
│    Tên khách: [ Anh Tuấn Viettel                     ]      │
│    Số lượng:  [-]  [ 2 ]  [+]   [1] [2] [3] [5]             │
│    Đơn giá:   [ 35000       ]   [30k] [35k] [40k] [50k]     │
│    Ghi chú:   [ Cơm sườn, thêm trứng                 ]      │
│    Thành tiền: 2 suất × 35.000 đ = 70.000 đ                 │
│    [              + GHI NỢ NGAY (48px)                    ] │
├─────────────────────────────────────────────────────────────┤
│ 🔍 [ Tìm tên khách, số ĐT, món ăn...                      ] │ <- Search & Filter
│ [ Đang nợ (1) ]   [ Tất cả (3) ]   [ Đã trả (2) ]           │
├─────────────────────────────────────────────────────────────┤
│ 👤 Phố                                            105.000 đ │ <- Debtor Cards List
│    3 lần nợ • Gần nhất: 13:45 29/08/2026 • Cơm sườn         │
│    [ ✓ Đã Thanh Toán ]                 [ + Ghi Thêm ]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. PWA & Standalone Capability
- **Manifest:** Configured with `display: standalone`, `theme_color: #10b981`, and scalable SVG vector icons.
- **Service Worker:** Registers [`public/sw.js`](file:///E:/GhiNoApplication/public/sw.js) for instant caching of offline assets.
- **Safe Area Insets:** Employs Tailwind CSS safe area utilities (`pb-safe`, `viewport-fit=cover`) for compatibility with notched iOS screens (iPhone 12/13/14/15/16).
