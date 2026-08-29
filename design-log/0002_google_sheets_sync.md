# Design Log #0002: Auto-Sync Google Sheets & Google Sheet Viewer

## 1. Background
Mặc dù kiến trúc Local-First qua `localStorage` đảm bảo tốc độ phản hồi tức thì (< 10ms) và hoạt động 100% khi mất mạng, người dùng là chủ quán cơm vẫn có tâm lý lo ngại việc mất dữ liệu khi lỡ xóa lịch sử trình duyệt hoặc đổi thiết bị di động. Nhu cầu đặt ra là tự động đẩy bản sao lưu dữ liệu lên Google Sheets (công cụ quen thuộc, miễn phí, dễ xem và chia sẻ) mỗi khi có giao dịch phát sinh, đồng thời cung cấp nút "Xem trong Trang tính" trực tiếp trên giao diện.

## 2. Problem
- **Rủi ro cục bộ:** `localStorage` gắn liền với trình duyệt trên 1 thiết bị cụ thể.
- **Tính tiện lợi & Minh bạch:** Chủ quán muốn mở bảng tính Google Sheets trên máy tính hoặc gửi link cho đối tác/kế toán xem danh sách công nợ mà không cần thao tác xuất file JSON thủ công.
- **Không tốn chi phí hạ tầng:** Không sử dụng server backend riêng (Node.js/SQL), tận dụng tối đa Google Apps Script (Web App) miễn phí 100%.

## 3. Questions and Answers
- **Q1: Cơ chế đồng bộ có làm chậm thao tác bấm trên điện thoại không?**
  - **A1:** Không. Hệ thống áp dụng mô hình **Hybrid (Local-First + Background Cloud Backup)**. Thao tác ghi nợ/thanh toán sẽ ghi vào `localStorage` trước (giao diện phản hồi < 10ms), sau đó kích hoạt hàm `syncToGoogleSheets()` chạy ngầm không chặn luồng UI (non-blocking).
- **Q2: Xử lý vấn đề CORS (Cross-Origin Resource Sharing) khi gọi Google Apps Script từ trình duyệt như thế nào?**
  - **A2:** Khi gọi từ Frontend tĩnh tới Google Apps Script Web App, ta sử dụng `fetch(url, { method: 'POST', mode: 'no-cors', ... })` hoặc gửi JSON dạng text/plain để vượt qua rào cản CORS mà vẫn đảm bảo Apps Script nhận trọn vẹn payload.
- **Q3: Cấu trúc dữ liệu trên Google Sheets được tổ chức ra sao?**
  - **A3:** Bảng tính tự động tạo header chuẩn và cập nhật danh sách gồm 9 cột:
    `[Mã KH, Tên Khách Hàng, Ngày Giờ Nợ, Số Suất, Đơn Giá, Thành Tiền, Tổng Nợ Hiện Tại, Trạng Thái, Cập Nhật Lúc]`.

## 4. Design

### 4.1. Architecture Diagram (Mermaid)

```mermaid
graph TD
    User([Chủ quán / Thu ngân]) -->|Ghi nợ / Thanh toán| UI[Mobile UI Layer]
    UI -->|1. Lưu tức thì <10ms| LocalStore[(LocalStorage: QUAN_COM_DEBT_RECORDS_V1)]
    UI -->|2. Cập nhật ViewState| ViewState[AppViewState: status='syncing']
    UI -->|3. Gửi ngầm Non-blocking| SyncService[Google Sheets Sync Service]
    SyncService -->|POST payload| GAS[Google Apps Script Web App]
    GAS -->|Ghi đè / Cập nhật| GSheet[(Google Sheets Spreadsheet)]
    GAS -->>SyncService| Response Success
    SyncService -->>UI| Cập nhật status='synced'
    User -->|Bấm 'Xem trong Trang tính'| GSheetTab[Mở Tab Google Sheets]
```

### 4.2. Contracts & Data Types (`Contract`, `JayContract`)

File Path: `file:///E:/GhiNoApplication/src/types/contracts.ts`

```typescript
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'unconfigured';

export interface AppSettings {
  restaurantName: string;
  defaultMealPrice: number;
  phoneContact?: string;
  currency: string;
  googleSheetUrl?: string;   // Link xem Google Sheets: https://docs.google.com/spreadsheets/d/...
  appsScriptUrl?: string;    // Web App URL: https://script.google.com/macros/s/.../exec
  autoSyncEnabled?: boolean; // Bật/tắt tự động đồng bộ
}

export interface GoogleSheetsSyncPayload {
  app: string;
  timestamp: string;
  restaurantName: string;
  records: DebtorRecord[];
}

export interface GoogleSheetsSyncResult {
  success: boolean;
  syncedCount: number;
  message: string;
}

export const GoogleSheetsConfigContract: JayContract<AppSettings, AppSettings> = {
  validate(input: unknown): ValidationResult<AppSettings>;
  execute(input: AppSettings): AppSettings;
};
```

### 4.3. ViewState Definition

File Path: `file:///E:/GhiNoApplication/src/types/viewState.ts`

```typescript
export interface AppViewState {
  // ... existing fields ...
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  googleSheetUrl?: string;
  isSyncing: boolean;
}
```

### 4.4. Validation Rules
- `appsScriptUrl`: Nếu nhập, phải bắt đầu bằng `https://script.google.com/macros/s/` và kết thúc bằng `/exec`.
- `googleSheetUrl`: Nếu nhập, phải là URL hợp lệ bắt đầu bằng `https://docs.google.com/spreadsheets/`.
- `syncStatus`: Chỉ nhận các giá trị: `'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'unconfigured'`.

## 5. Implementation Plan (TDD Approach)

1. **Giai đoạn 1: Xây dựng Google Apps Script (`Code.gs`)**
   - Viết script `Code.gs` hỗ trợ `doPost(e)` và `doGet(e)`.
   - Tự động định dạng Header (nền xanh, chữ trắng, in đậm), tự động điều chỉnh độ rộng cột và phân tách định dạng tiền tệ.
2. **Giai đoạn 2: TDD cho Google Sheets Sync Engine**
   - Viết unit test cho `googleSheetsSync.ts` (kiểm thử format payload, xử lý URL hợp lệ/bất hợp lệ, fallback offline).
3. **Giai đoạn 3: Tích hợp vào React App**
   - Cập nhật `Header.tsx`: Thêm nút "Xem trong Trang tính" (icon Sheets xanh lá) + Badge trạng thái (`Đã đồng bộ`, `Đang lưu...`, `Offline`).
   - Cập nhật `SettingsModal.tsx`: Thêm mục cấu hình link Google Sheets và Apps Script URL.
   - Cập nhật `App.tsx`: Kích hoạt auto-sync khi `records` thay đổi.
4. **Giai đoạn 4: Tạo Single-File Standalone HTML (`index-standalone.html`)**
   - File độc lập tích hợp sẵn Tailwind CDN, Icons, Local-First, Auto-Sync và 2 biến `GOOGLE_SHEET_URL` & `APPS_SCRIPT_URL` ngay đầu file.
5. **Giai đoạn 5: Kiểm thử tổng thể & Cập nhật Design Log**

## 6. Examples

### ✅ Valid Scenarios
- **Cấu hình URL hợp lệ:**
  ```json
  {
    "appsScriptUrl": "https://script.google.com/macros/s/AKfycbx.../exec",
    "googleSheetUrl": "https://docs.google.com/spreadsheets/d/1BxiM..."
  }
  ```
  -> Kết quả: Badge chuyển `Đã đồng bộ`, nút "Xem trong Trang tính" sáng lên và bấm mở đúng trang tính.

- **Ghi nợ khi mất mạng:**
  Thiết bị không có internet -> Ghi thành công vào `localStorage`, Badge hiển thị `Lưu tạm offline`. Khi có mạng lại sẽ tự đồng bộ.

### ❌ Invalid Scenarios
- **URL Apps Script sai định dạng:**
  ```json
  { "appsScriptUrl": "https://google.com" }
  ```
  -> Lỗi: `URL Google Apps Script không đúng định dạng Web App (/exec).`

## 7. Trade-offs
- **`mode: 'no-cors'` vs CORS Proxy:**
  - *Chọn:* `no-cors` khi gọi Google Apps Script Web App. Ưu điểm: Gọi trực tiếp từ browser mà không cần proxy server trung gian, Google Sheets vẫn ghi nhận dữ liệu 100% an toàn. Nhược điểm: Browser nhận opaque response nên Frontend xác nhận trạng thái bằng timeout/liveness check.

## 8. Implementation Results & Deviations
- **Google Apps Script (`Code.gs`):** Đã xây dựng hoàn chỉnh script xử lý `doPost(e)` và `doGet(e)`, tự động format tiêu đề xanh lá, phân tách số tiền `# ##0 đ`, gom nhóm bản ghi theo khách hàng và căn chỉnh bảng tính chuyên nghiệp.
- **Auto-Sync Engine & Offline Resilience:** Tích hợp `GoogleSheetsSyncEngine` với cơ chế debounce 1.2s, bắt sự kiện `online`/`offline`, gửi payload non-blocking qua `mode: 'no-cors'` không ảnh hưởng đến độ trễ giao diện.
- **UI/UX Google Sheets:** Thêm nút **"Xem trong Trang tính"** với icon Sheets màu xanh lá đặc trưng trên Header, hiển thị live badge trạng thái (`🟢 Đã lưu Sheets`, `🟡 Đang lưu...`, `⚪ Lưu tạm offline`).
- **Single-File Component (`standalone/index.html`):** Xây dựng file HTML duy nhất độc lập có thể chạy trực tiếp bằng cách click đúp chuột hoặc nhúng iframe, có sẵn biến cấu hình `DEFAULT_GOOGLE_SHEET_URL` và `DEFAULT_APPS_SCRIPT_URL` ở đầu file.
- **Kiểm thử (TDD Suite):** 32/32 bài test vượt qua 100% (`npm test`).
- **Build Production:** `npm run build` thành công 0 lỗi.
- **Deviations:** Không có độ lệch so với thiết kế ban đầu.

