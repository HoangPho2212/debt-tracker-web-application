# 05. Deployment, Maintenance & Disaster Recovery Guide

## 1. Deploying to Vercel (1 Minute Setup)

1. Push your repository to GitHub.
2. Sign in to [vercel.com](https://vercel.com) ➔ Click **Add New Project**.
3. Import the GitHub repository:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.
5. Vercel provisions a production URL (e.g., `https://quan-com-debt-tracker.vercel.app`) with automatic SSL, Edge CDN caching, and continuous deployment on every `git push`.

---

## 2. Setting Up on Mobile Devices (Restaurant Staff Guide)

### On iPhone (Safari):
1. Open the production URL in Safari.
2. Tap the **Share** button (box with an upward arrow) at the bottom toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. The app icon appears on your home screen and launches in full-screen standalone mode without Safari browser toolbars.

### On Android (Chrome):
1. Open the production URL in Google Chrome.
2. Tap the **three vertical dots** in the top right corner.
3. Tap **Install App** or **Add to Home screen**.
4. The app installs as a native-feeling Web APK with offline caching.

---

## 3. Disaster Recovery & Maintenance Strategy

1. **Automatic Continuous Cloud Backup (Google Sheets):**
   - Every single mutation (adding a meal, editing details, settling debt) is automatically mirrored to Google Sheets in real-time.
   - If a phone is lost, broken, or dropped into water, all records remain intact in your Google Sheets spreadsheet.

2. **JSON Export / Import (Disaster Recovery):**
   - Click the **Database (Database)** icon in the header toolbar.
   - Click **Export Backup (JSON)** to download a complete copy of the ledger.
   - Save the file to Google Drive, iCloud, or send it to your personal Zalo chat.

3. **Restoring on a New Device:**
   - Open the app on the new phone.
   - Go to **Settings ⚙️** ➔ Paste your **Google Apps Script Web App URL**.
   - The app will immediately pull all active records from Google Sheets down to the new phone!
