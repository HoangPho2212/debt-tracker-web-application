# Sổ Ghi Nợ Quán Cơm (Local-First Mobile Web App)

Ứng dụng web hiện đại, tối ưu 100% cho màn hình điện thoại (Mobile-First) và lưu trữ cục bộ trên thiết bị (Local-First), giúp chủ quán cơm bình dân quản lý ghi nợ, tra cứu và thu tiền nhanh chóng mà không cần server hay cơ sở dữ liệu cloud.

---

## 🌟 Tính Năng Nổi Bật

1. **Ghi nợ siêu tốc (1 chạm & 1 tay):**
   - Tự động gợi ý tên khách cũ khi vừa gõ phím.
   - Nút tăng giảm số lượng suất ăn `[ - ]` `[ + ]` và phím tắt chọn nhanh `1`, `2`, `3`, `5` suất.
   - Điền sẵn đơn giá mặc định (tùy chỉnh được trong Cài đặt).
   - Tự động cộng dồn nợ nếu khách đã từng có hồ sơ nợ trước đó.

2. **Tìm kiếm tức thì không dấu (Vietnamese Diacritics Engine):**
   - Gõ "tuan", "lan", "viettel"... tìm ra ngay cả khi có dấu hoặc viết hoa/viết thường.
   - Lọc nhanh theo các tab: **Tất cả**, **Đang nợ**, **Đã trả**.

3. **Thanh toán & Đóng nợ:**
   - Nút **[ ✓ Đã Thanh Toán ]** trực tiếp trên thẻ khách hàng kèm pop-up xác nhận tránh bấm nhầm.
   - Xem toàn bộ lịch sử các bữa ăn nợ (ngày giờ, số suất, đơn giá, món ăn).
   - Xóa từng bữa lẻ nếu ghi nhầm hoặc khách trả trước 1 bữa.
   - Tính năng **Sao chép hóa đơn gửi Zalo/SMS** để đối chiếu với khách hàng.

4. **100% Offline & Bảo Mật Tuyệt Đối (Local-First):**
   - Lưu trữ toàn bộ trên trình duyệt máy khách (`localStorage`), mất mạng hoặc vào vùng không có sóng 4G/Wifi vẫn hoạt động bình thường.
   - Không lo bị lộ thông tin khách hàng hay phát sinh phí duy trì máy chủ hàng tháng (0đ chi phí vận hành).

5. **Sao Lưu & Phục Hồi Dữ Liệu (Backup & Restore):**
   - Xuất file `.json` sao lưu chỉ với 1 cú chạm để lưu về máy, Google Drive hoặc gửi qua Zalo.
   - Phục hồi lại toàn bộ sổ nợ khi đổi điện thoại mới hoặc xóa trình duyệt.

6. **PWA (Progressive Web App):**
   - Cài đặt ra Màn hình chính (Add to Home Screen) trên iPhone (Safari) và Android (Chrome).

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Môi Trường Phát Triển

### Yêu Cầu:
- Node.js >= 18
- Trình quản lý gói npm

### 1. Khởi chạy Local:
```bash
# Cài đặt dependencies
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

### 2. Chạy Kiểm Thử (Unit Tests - Vitest TDD):
```bash
npm run test
```

### 3. Đóng gói Production (Build tĩnh):
```bash
npm run build
```
Thư mục `dist/` chứa toàn bộ mã nguồn tĩnh sẵn sàng deploy lên Vercel, Netlify hoặc GitHub Pages.

---

## 🚀 Hướng Dẫn Triển Khai Miễn Phí Lên Vercel

1. Đẩy dự án lên GitHub.
2. Đăng nhập [vercel.com](https://vercel.com) -> Chọn **Add New Project**.
3. Chọn kho lưu trữ GitHub vừa tạo -> Framework Preset: **Vite** -> Nhấn **Deploy**.
4. Vercel sẽ cấp đường link trực tiếp (ví dụ: `quan-com-no.vercel.app`) để chủ quán mở trên điện thoại.

---

## 📱 Hướng Dẫn Cài Ra Màn Hình Chính Trên Điện Thoại

- **iPhone (Safari):** Mở link -> Nhấn biểu tượng **Chia sẻ (Share)** ở cạnh dưới -> Chọn **Thêm vào MH chính (Add to Home Screen)**.
- **Android (Chrome):** Mở link -> Nhấn dấu **3 chấm** góc trên -> Chọn **Cài đặt ứng dụng / Thêm vào màn hình chính**.
