# 03. Data Model & State Schema

## 1. Schema Định Dạng Dữ Liệu (TypeScript Interface Concept)

```typescript
interface DebtHistoryEntry {
  entryId: string;       // Unique ID cho mỗi lần nợ: "ENT_1714000000"
  timestamp: string;     // ISO String hoặc chuỗi định dạng: "2026-08-28T12:30:00"
  displayDate: string;   // Chuỗi hiển thị tiếng Việt: "12:30 - 28/08/2026"
  quantity: number;      // Số suất cơm (ví dụ: 1, 2, 5)
  pricePerMeal: number;  // Đơn giá 1 suất tại thời điểm nợ (VNĐ)
  amount: number;        // Thành tiền = quantity * pricePerMeal
  note?: string;         // Ghi chú thêm (ví dụ: "thêm trứng", "mang về")
}

interface DebtorRecord {
  id: string;            // ID duy nhất của khách: "KH_1714000000"
  name: string;          // Tên khách hàng (chuẩn hóa trim)
  normalizedName: string;// Tên không dấu, viết thường phục vụ search nhanh
  phone?: string;        // Số điện thoại (tùy chọn)
  totalDebt: number;     // Tổng số tiền đang nợ hiện tại (VNĐ)
  status: 'active' | 'settled'; // Trạng thái nợ
  createdAt: string;     // Ngày tạo hồ sơ
  updatedAt: string;     // Ngày cập nhật nợ mới nhất
  history: DebtHistoryEntry[]; // Danh sách chi tiết các lần nợ
}

type DebtStore = DebtorRecord[];
```

## 2. Mẫu Dữ Liệu Thực Tế (Sample JSON)

```json
[
  {
    "id": "debt_1724851200000",
    "name": "Anh Tuấn Viettel",
    "normalizedName": "anh tuan viettel",
    "phone": "0987654321",
    "totalDebt": 70000,
    "status": "active",
    "createdAt": "2026-08-28 11:30",
    "updatedAt": "2026-08-29 12:15",
    "history": [
      {
        "entryId": "ent_1",
        "timestamp": "2026-08-28T11:30:00",
        "displayDate": "11:30 28/08/2026",
        "quantity": 1,
        "pricePerMeal": 35000,
        "amount": 35000,
        "note": "Cơm sườn"
      },
      {
        "entryId": "ent_2",
        "timestamp": "2026-08-29T12:15:00",
        "displayDate": "12:15 29/08/2026",
        "quantity": 1,
        "pricePerMeal": 35000,
        "amount": 35000,
        "note": "Cơm gà nướng"
      }
    ]
  }
]
```
