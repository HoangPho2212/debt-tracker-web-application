# 02. System Architecture & Technical Specifications

## 1. Kiến Trúc Tổng Quan (Architecture Overview)

```
[ Mobile Browser / PWA ]
          │
          ├─► UI View (HTML5 / Tailwind CSS / Vanilla JS or Vue)
          │         │
          │         ▼
          ├─► State Management / Business Logic (Calculation, Validation)
          │         │
          │         ▼
          └─► Persistence Layer (LocalStorage Engine)
                    │
                    └─► Local JSON Store (`debt_records_v1`)
```

## 2. Nguyên Tắc Thiết Kế Kỹ Thuật (Design Principles)
1. **Zero-Backend / 100% Client-Side:** Không sử dụng API Server, không phát sinh chi phí hạ tầng.
2. **Offline-First:** Ứng dụng chạy hoàn toàn trên bộ nhớ đệm của trình duyệt di động, mất sóng 4G/Wifi vẫn hoạt động trơn tru.
3. **Optimistic UI:** Thao tác nhập, xóa, cập nhật diễn ra tức thì (<10ms) vì không có độ trễ mạng.
4. **Data Isolation:** Dữ liệu gắn liền với LocalStorage của trình duyệt trên máy của người dùng.

## 3. Quản Lý Bộ Nhớ Trình Duyệt (LocalStorage Strategy)
- **Khóa lưu trữ (Storage Key):** `QUAN_COM_DEBT_RECORDS_V1`
- **Cơ chế đồng bộ:** Mỗi khi có thay đổi (Add, Settle, Delete, Import), state trong RAM được serialize thành chuỗi JSON và ghi đè vào LocalStorage qua hàm `saveToStorage()`.
- **Dung lượng:** `localStorage` hỗ trợ ~5MB (tương đương hơn 10.000 lượt ghi nợ, quá đủ cho nhu cầu quán cơm trong nhiều năm).
