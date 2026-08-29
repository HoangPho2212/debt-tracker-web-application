# 01. Product Requirements Document (PRD)

## 1. Context & Business Objectives
- **Target Audience:** Vietnamese local eatery owners, counter cashiers, and restaurant staff using mobile devices during busy meal services.
- **Problem Statement:** Traditional paper notebooks are easily damaged, lost, prone to calculation errors, and difficult to search when customers return repeatedly.
- **Solution:** A blazing-fast, mobile-first web app that loads instantly (<1s), records debts in under 3 seconds, accumulates balances automatically, and synchronizes with Google Sheets in real-time.

---

## 2. User Stories & Functional Workflows

### US-01: Record New Meal Debt or Accumulate on Existing Debtor
- **Inputs:** Customer Name, Meal Quantity (default `1`), Unit Price per Meal (default configurable, e.g., `35,000 VND`), Optional Notes (e.g., `Cơm sườn`, `Thêm trứng`), Optional Phone Number.
- **Processing:**
  - Captures real-time ISO timestamp and Vietnamese formatted date (`HH:mm dd/MM/yyyy`).
  - Normalizes the name using an unaccented, case-insensitive algorithm (`Tuấn` ➔ `tuan`).
  - **If customer already exists:** Appends a new entry to the customer's `history` timeline and accumulates the `totalDebt`.
  - **If customer is new:** Creates a new `DebtorRecord` profile with the initial debt amount.
- **Output:** Immediately updates the UI ViewState (<5ms) and persists to `localStorage`, triggering an asynchronous Google Sheets sync.

### US-02: Instant Search & Filter (Vietnamese Diacritics Engine)
- **Action:** User types keywords into the search bar (customer name, dish note, or phone number).
- **Processing:** Real-time debounced filtering matching both accented and non-accented Vietnamese characters.
- **Output:** Renders filtered customer cards with total debt highlighted and quick action buttons.

### US-03: Debt Settlement & Account Closure
- **Action:** User taps the **[ ✓ Settle Debt ]** button on a customer's card.
- **Processing:**
  - Displays a confirmation modal showing customer name and exact amount to prevent accidental clicks.
  - Upon confirmation: Sets `totalDebt = 0` and `status = 'settled'`.
  - Updates local storage and broadcasts the settlement to Google Sheets.

### US-04: Granular History Inspection & Meal Deletion
- **Action:** User clicks on a customer card to open the Detail Modal.
- **Processing:** Displays a reverse-chronological list of every meal entry with quantity, price, dish notes, and timestamps.
- **Granular Actions:** Allows deleting individual meal entries (e.g., if entered incorrectly) and recalibrates the `totalDebt` accordingly.

### US-05: Receipt Sharing for Zalo & SMS
- **Action:** User clicks **Copy Receipt** inside the detail modal.
- **Processing:** Formats a clean text receipt summarizing unpaid meals and total balance.
- **Output:** Copies to clipboard with a toast notification, ready to paste into Zalo, Telegram, or SMS.

### US-06: 2-Way Google Sheets Auto-Sync & Multi-Device Polling
- **Action:** When multiple devices manage debts simultaneously (e.g., owner phone and cashier tablet).
- **Processing:**
  - **Fetch on Load:** Automatically downloads the latest records from Google Sheets upon app launch.
  - **Auto-Push:** Debounces background writes to Google Apps Script.
  - **1-Minute Polling:** Polls `doGet` every 60 seconds to reconcile state across all active devices.
- **Output:** Live sync status badge in Header (`🟢 Synced`, `🟡 Syncing...`, `⚪ Offline`).

### US-07: Backup & Disaster Recovery (JSON Export / Import)
- **Export:** Downloads a single `.json` file containing all debtor records and restaurant configurations.
- **Import:** Restores all data from an uploaded `.json` backup file with validation.
