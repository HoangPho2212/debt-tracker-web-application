# 04. UI/UX & Mobile-First Specifications

## 1. Triết Lý Thiết Kế
- **Mobile-First:** Tối ưu kích thước nút bấm (tối thiểu 44px) để bấm ngón tay dễ dàng lúc đang bán hàng.
- **One-Thumb Operation:** Các nút thao tác chính (Ghi nợ, Thanh toán, Tìm kiếm) đặt ở vị trí thuận tiện khi cầm điện thoại 1 tay.
- **Rõ Ràng & Tránh Nhầm Lẫn:** Số tiền nợ hiển thị to, in đậm, dùng dấu chấm phân tách hàng nghìn (ví dụ: `70.000 đ`).

## 2. Các Phân Vùng Giao Diện (Layout Hierarchy)
1. **Header:** Tên quán cơm + Nút Cài đặt / Sao lưu dữ liệu.
2. **Thanh Thống Kê Nhanh (Top Summary Cards):**
   - Tổng tiền nợ hiện tại của quán.
   - Tổng số khách đang nợ.
3. **Khung Nhập Nợ Nhanh (Quick Add Form):**
   - Ô nhập tên khách có Auto-complete/gợi ý tên cũ.
   - Bộ chọn số lượng suất: [ - ] `1` [ + ]
   - Ô đơn giá (mặc định 35.000đ, có thể sửa).
   - Nút lớn: **[ + Ghi Nợ Ngay ]** (Màu xanh dương/xanh lá).
4. **Thanh Tìm Kiếm & Bộ Lọc:**
   - Input tìm kiếm tức thì theo tên.
5. **Danh Sách Khách Nợ (Cards List):**
   - Mỗi khách là một card riêng biệt.
   - Tên khách + Tổng tiền nợ (Màu đỏ nổi bật).
   - Nút mở xem chi tiết lịch sử từng bữa.
   - Nút hành động: **[ ✓ Đã Thanh Toán ]** (Màu xanh lá) và **[ Sửa / Xóa ]**.
