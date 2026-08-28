# 01. Product Requirements Document (PRD)

## 1. Bối cảnh & Mục tiêu
- **Đối tượng sử dụng chính:** Chủ quán ăn / nhân viên thu ngân sử dụng trực tiếp trên điện thoại di động (Mobile Web).
- **Vấn đề cần giải quyết:** Sổ tay giấy dễ rách, mất, khó tìm kiếm tên khách cũ và tính nhầm tiền cộng dồn khi khách nợ nhiều lần.
- **Giải pháp:** Web App tĩnh, tải trang tức thì, lưu nợ ngay trên máy, tìm kiếm theo tên tức thì, cộng dồn tự động và đóng nợ 1 chạm khi thanh toán.

## 2. Luồng Nghiệp Vụ (User Stories & Workflows)

### US-01: Ghi nợ suất cơm mới hoặc cộng dồn nợ cũ
- **Input:** Tên khách hàng, Số lượng suất cơm (mặc định 1), Đơn giá mỗi suất (mặc định cấu hình sẵn, ví dụ: 35.000 VNĐ).
- **Xử lý:**
  - Tự động bắt `timestamp` theo thời gian thực (Giờ:Phút Ngày/Tháng/Năm).
  - Kiểm tra xem tên khách đã tồn tại trong danh sách nợ chưa (không phân biệt chữ hoa/chữ thường).
  - **Nếu đã tồn tại:** Cộng dồn số tiền nợ mới vào `totalDebt`, thêm 1 bản ghi vào mảng `history` của khách.
  - **Nếu chưa tồn tại:** Tạo mới một hồ sơ khách nợ (`debtor`) với `totalDebt` ban đầu.
- **Output:** Cập nhật ngay danh sách hiển thị và lưu vào `localStorage`.

### US-02: Tìm kiếm & Tra cứu nợ
- **Thao tác:** Nhập từ khóa tên khách vào thanh tìm kiếm.
- **Xử lý:** Lọc danh sách theo thời gian thực (realtime debounce/input filter) không phân biệt dấu/hoa thường.
- **Output:** Hiển thị tổng số tiền nợ hiện tại và danh sách lịch sử từng lần nợ chi tiết (ngày giờ, số suất, thành tiền).

### US-03: Thanh toán nợ (Đóng ticket / Xóa nợ)
- **Thao tác:** Bấm nút "Đã Thanh Toán" trên thẻ của khách hàng.
- **Xử lý:**
  - Hiển thị pop-up / modal xác nhận để tránh bấm nhầm.
  - Sau khi xác nhận: Đóng ticket nợ (chuyển sang trạng thái `paid` hoặc xóa khỏi danh sách nợ hiện hành).
  - Lưu cập nhật vào bộ nhớ.

### US-04: Sao lưu & Phục hồi dữ liệu (Backup & Restore)
- **Xuất dữ liệu:** Cho phép tải về máy 1 file `.json` chứa toàn bộ dữ liệu ghi nợ.
- **Nhập dữ liệu:** Cho phép tải file `.json` sao lưu lên để phục hồi dữ liệu khi đổi máy hoặc xóa nhầm trình duyệt.
