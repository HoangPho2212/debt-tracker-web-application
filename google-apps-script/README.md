# Google Sheets Auto-Sync Setup Guide

Set up real-time, bi-directional synchronization between the Debt Tracker Web App and your private Google Sheets in **less than 2 minutes** for free.

---

## 📌 Step 1: Create a New Google Spreadsheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet (e.g., name it `Sổ Ghi Nợ Quán Cơm`).
2. Copy the spreadsheet URL from your browser address bar (e.g., `https://docs.google.com/spreadsheets/d/1abc.../edit`).

---

## 📌 Step 2: Paste Google Apps Script Code
1. In your newly created spreadsheet, click on **Extensions** in the top menu ➔ select **Apps Script**.
2. Delete any boilerplate code inside `Code.gs` and copy-paste the entire contents of [`google-apps-script/Code.gs`](./Code.gs).
3. Press **Ctrl + S** (or click the disk icon) to Save the project.

---

## 📌 Step 3: Deploy as a Web App (Get API Endpoint URL)
1. Click the blue **Deploy** button at the top right ➔ Select **New deployment**.
2. Click the gear icon ⚙️ next to *Select type* ➔ Choose **Web app**.
3. Configure the deployment settings:
   - **Description:** `Debt Tracker Bi-Directional Auto Sync`
   - **Execute as:** `Me (your Gmail address)`
   - **Who has access:** **`Anyone`** *(Required so the client web app can send/receive sync requests without Google OAuth popups).*
4. Click **Deploy**.
5. When Google prompts for authorization:
   - Click **Review permissions** ➔ Select your Google account.
   - Click **Advanced** ➔ Click **Go to Untitled project (unsafe)** ➔ Click **Allow**.
6. Copy the **Web App URL** ending with **`/exec`** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 📌 Step 4: Configure the Web App
1. Open the Debt Tracker app on your phone or computer.
2. Click on the **Settings ⚙️** icon in the header toolbar.
3. Paste your **Google Sheet URL** into the *"Google Sheets Link"* field, and paste your **Web App URL (/exec)** into the *"Google Apps Script Web App URL"* field.
4. Click **Save Settings**.

---

## 🔄 How the 2-Way Sync Engine Operates:
- **On App Load (Fetch on Load):** The app calls `doGet` from Google Apps Script to pull the latest debt records into local storage.
- **On Change (Auto-Push):** Every newly added debt or settled payment automatically updates both the formatted spreadsheet and backup store in the background.
- **1-Minute Polling:** The app automatically checks for cloud updates every 60 seconds so multiple cashiers/devices stay 100% in sync.
- **View in Google Sheets:** Click the green **Trang Tính** button on the header toolbar to open and inspect your live ledger at any time.
