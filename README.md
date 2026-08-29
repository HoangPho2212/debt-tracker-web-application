# Vietnamese Eatery Debt Tracker (Local-First Mobile Web App)

A high-performance, mobile-first, local-first web application designed for Vietnamese eateries and local diners (*quán cơm bình dân*). It allows shop owners and cashiers to quickly log meal debts, aggregate records, settle balances with a single tap, and automatically synchronize data in real-time with Google Sheets across multiple devices—with zero server costs and full offline reliability.

---

## 🌟 Key Features

1. **Ultra-Fast Debt Recording (One-Thumb Friendly):**
   - Instant customer autocomplete with previous name history.
   - Quantity counter buttons `[ - ]` / `[ + ]` and quick preset chips (`1`, `2`, `3`, `5` meals).
   - Pre-filled default meal price (customizable in Settings, e.g., 35,000 VND).
   - Dish and condiment quick chips (`+ Cơm sườn`, `+ Cơm gà`, `+ Thêm trứng`, `+ Mang về`).
   - Automatic balance accumulation for existing debtor profiles.

2. **Real-Time Vietnamese Diacritics Search Engine:**
   - Case-insensitive, accent-insensitive search (typing `tuan`, `lan`, `viettel` matches `Tuấn`, `Lan`, `Viettel`).
   - Instant filter tabs: **All**, **Active Debt**, **Settled**.

3. **Settlement & Debt History Management:**
   - One-tap **[ ✓ Settle Debt ]** button on customer cards with confirmation popups.
   - Detailed timeline history of each meal (date & time, quantity, unit price, total amount, notes).
   - Granular deletion of individual meal entries if mistakenly logged.
   - **Copy Receipt for Zalo/SMS** button for easy cross-checking with customers.

4. **Bi-Directional Real-Time Google Sheets Auto-Sync (2-Way Cloud Backup):**
   - **Fetch on Load:** Automatically pulls the latest ledger from Google Sheets when opening the app.
   - **Auto-Push:** Debounced background sync whenever debts are recorded or settled.
   - **1-Minute Auto-Polling:** Silently refreshes and reconciles data every 60 seconds across multiple devices (e.g., cashier tablet and owner phone).
   - **"View in Google Sheets" Button:** Prominent green toolbar button to open the live spreadsheet directly.
   - **Live Status Badges:** `🟢 Synced`, `🟡 Syncing...`, `⚪ Offline (Local Storage)`, `🔴 Sync Error`.

5. **100% Offline Resilience & Privacy (Local-First):**
   - All state is preserved locally in `localStorage` (<5ms latency), operating seamlessly even without 4G/Wi-Fi coverage.
   - Zero monthly hosting/database fees ($0 operating cost).

6. **JSON Backup & Disaster Recovery:**
   - One-click `.json` backup file export to save locally, on Google Drive, or send via Zalo.
   - Instant restore capability when switching phones or resetting browser data.

7. **PWA (Progressive Web App):**
   - Installable to Home Screen on iOS (Safari) and Android (Chrome) with standalone app feel.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons.
- **Testing:** Vitest, React Testing Library (100% test pass rate with TDD).
- **Backend / Sync:** Google Apps Script (Web App Endpoint) + Google Sheets.
- **Standalone Mode:** Single-file standalone HTML component in `standalone/index.html`.
- **Deployment:** Vercel Static Hosting (Edge CDN).

---

## 🚀 Quick Start & Development

### Prerequisites:
- Node.js >= 18
- npm

### 1. Install & Run Locally:
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### 2. Run Test Suite (Vitest TDD):
```bash
npm run test
```

### 3. Production Build:
```bash
npm run build
```
The optimized static bundle will be built into the `dist/` directory, ready for instant deployment.

---

## 📊 Setting Up Google Sheets Auto-Sync (2 Minutes)

1. Create a new Google Spreadsheet at [sheets.google.com](https://sheets.google.com) (e.g., named `Sổ Ghi Nợ Quán Cơm`).
2. Go to **Extensions** ➔ **Apps Script**.
3. Paste the contents of [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) into the script editor.
4. Click **Deploy** ➔ **New deployment** ➔ Select **Web App**:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
5. Copy the generated Web App URL ending with `/exec`.
6. In the web app, click **Settings ⚙️** and paste the **Google Sheet Link** and **Web App URL**.

---

## 🌐 Deploy to Vercel (Free)

1. Push your repository to GitHub.
2. Log in to [vercel.com](https://vercel.com) ➔ Click **Add New Project**.
3. Select the repository ➔ Framework Preset: **Vite** ➔ Click **Deploy**.
4. Vercel provides a custom HTTPS link (e.g., `quan-com-debt-tracker.vercel.app`).

---

## 📱 Mobile Add-to-Home-Screen Instructions

- **iOS (Safari):** Open the website link ➔ Tap **Share** icon at the bottom ➔ Select **Add to Home Screen**.
- **Android (Chrome):** Open the website link ➔ Tap the **three dots** menu icon ➔ Select **Install App / Add to Home screen**.

---

## 📄 License
MIT License. Built for Vietnamese local food vendors and small dining establishments.
