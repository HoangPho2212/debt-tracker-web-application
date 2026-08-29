# Hướng Dẫn Thiết Lập Tự Động Đồng Bộ Google Sheets (Auto-Sync)

Chỉ cần **2 phút** thiết lập miễn phí theo các bước dưới đây để kết nối Sổ Ghi Nợ Quán Cơm với Google Sheets của bạn.

---

## 📌 Bước 1: Tạo Google Sheets mới
1. Truy cập [sheets.google.com](https://sheets.google.com) và tạo một bảng tính mới (đặt tên ví dụ: `Sổ Ghi Nợ Quán Cơm`).
2. Copy đường link trang tính từ thanh địa chỉ trình duyệt (Link có dạng: `https://docs.google.com/spreadsheets/d/1abc.../edit`).

---

## 📌 Bước 2: Dán mã Google Apps Script
1. Trên trang tính vừa tạo, chọn menu **Tiện ích mở rộng (Extensions)** ➔ Chọn **Apps Script**.
2. Xóa toàn bộ code mặc định trong file `Code.gs` và copy toàn bộ nội dung từ file [`google-apps-script/Code.gs`](./Code.gs) dán vào.
3. Nhấn tổ hợp phím **Ctrl + S** (hoặc biểu tượng Đĩa mềm) để Lưu.

---

## 📌 Bước 3: Triển khai Web App (Lấy URL API)
1. Nhấn nút xanh **Triển khai (Deploy)** ở góc trên bên phải ➔ Chọn **Triển khai mới (New deployment)**.
2. Chọn loại triển khai: Bấm biểu tượng Bánh răng ⚙️ ➔ Chọn **Ứng dụng web (Web App)**.
3. Điền thông số cấu hình:
   - **Mô tả:** `Auto Sync Sổ Nợ`
   - **Thực thi dưới dạng (Execute as):** `Tôi (Me / địa chỉ Gmail của bạn)`
   - **Ai có quyền truy cập (Who has access):** **`Bất kỳ ai (Anyone)`** *(Lưu ý: Bắt buộc chọn "Anyone" để web app gửi dữ liệu lên được).*
4. Nhấn nút **Triển khai (Deploy)**.
5. Nếu Google hiển thị thông báo yêu cầu cấp quyền:
   - Nhấn **Xem lại quyền truy cập (Review permissions)** ➔ Chọn tài khoản Google của bạn.
   - Nhấn **Nâng cao (Advanced)** ➔ Chọn **Đi tới ... (không an toàn)** ➔ Nhấn **Cho phép (Allow)**.
6. Copy **URL của ứng dụng web** (URL có đuôi kết thúc bằng `/exec`, ví dụ: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 📌 Bước 4: Dán URL vào Web App
1. Mở ứng dụng Sổ Ghi Nợ Quán Cơm trên điện thoại hoặc máy tính.
2. Bấm vào nút **Cài đặt ⚙️** trên Header.
3. Dán **Link Google Sheets** vào ô *"Link Google Sheets"* và dán **URL Web App (/exec)** vào ô *"Google Apps Script Web App URL"*.
4. Bấm **Lưu Cài Đặt**.

Từ bây giờ:
- Nút **"Xem trong Trang tính"** với icon Google Sheets màu xanh lá sẽ hiển thị ngay trên thanh công cụ.
- Mỗi lần bạn thêm nợ mới, thanh toán nợ hoặc chỉnh sửa, dữ liệu sẽ **tự động đồng bộ ngầm** lên bảng tính Google Sheets của bạn trong vòng vài giây!
