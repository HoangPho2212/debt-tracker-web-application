# Sổ Ghi Nợ Quán Cơm (Local-First Mobile Web App)

Dự án ứng dụng web nhẹ, tối ưu hóa 100% cho màn hình di động nhằm quản lý việc ghi nợ và thanh toán suất cơm tại quán ăn.

## 🎯 Mục Tiêu Dự Án
- **Mục đích:** Hỗ trợ chủ quán ghi nhận công nợ nhanh theo thời gian thực (tên khách, ngày giờ, số suất, đơn giá, cộng dồn nợ tự động).
- **Mô hình kiến trúc:** **Frontend-Only / Local-First**. Toàn bộ dữ liệu được lưu trữ và tính toán trực tiếp trên trình duyệt (`localStorage` / `IndexedDB`) của thiết bị di động.
- **Hạ tầng triển khai:** Tĩnh hoàn toàn (Vercel / GitHub Pages), 0đ chi phí vận hành, không cần server backend hay cơ sở dữ liệu cloud.

## 📂 Cấu Trúc Thư Mục Docs
- `docs/01_PRD.md`: Yêu cầu sản phẩm, phân tích nghiệp vụ quán cơm.
- `docs/02_ARCHITECTURE.md`: Kiến trúc hệ thống Frontend-only, luồng dữ liệu và cơ chế lưu trữ LocalStorage.
- `docs/03_DATA_MODEL.md`: Thiết kế cấu trúc dữ liệu JSON, State Management và chuẩn hóa trường.
- `docs/04_UI_UX_MOBILE_SPEC.md`: Đặc tả giao diện Mobile-First, luồng thao tác 1 chạm và PWA Add-to-Homescreen.
- `docs/05_DEPLOYMENT_MAINTENANCE.md`: Hướng dẫn triển khai Vercel, sao lưu/phục hồi (Backup/Restore).
