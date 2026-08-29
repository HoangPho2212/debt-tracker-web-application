# Vietnamese Eatery Debt Tracker - Architecture & Documentation

A lightweight, mobile-first, local-first web application designed for Vietnamese eateries and diners (*quán cơm bình dân*) to manage customer meal debts and settle balances in real-time.

## 🎯 Project Objectives
- **Core Mission:** Empower small restaurant owners and cashiers to record meal debts in seconds (customer name, timestamp, meal quantity, unit price, notes, and auto-accumulated debt balance).
- **Architecture Paradigm:** **Local-First / Frontend-First + Bi-Directional Google Sheets Sync**. All computations and data persistence run directly in the client browser (`localStorage`), with real-time cloud backup to Google Sheets via Google Apps Script.
- **Zero-Cost Infrastructure:** 100% static hosting on Vercel or GitHub Pages, requiring $0/month server costs or cloud database management.

## 📂 Documentation Sitemap
- [`docs/01_PRD.md`](./docs/01_PRD.md): Product Requirements Document, user stories, and business workflows.
- [`docs/02_ARCHITECTURE.md`](./docs/02_ARCHITECTURE.md): System architecture, bi-directional sync flow, and LocalStorage strategy.
- [`docs/03_DATA_MODEL.md`](./docs/03_DATA_MODEL.md): JSON data contracts, TypeScript interfaces, and sample state schemas.
- [`docs/04_UI_UX_MOBILE_SPEC.md`](./docs/04_UI_UX_MOBILE_SPEC.md): Mobile-first UI/UX specifications, touch targets, and PWA capabilities.
- [`docs/05_DEPLOYMENT_MAINTENANCE.md`](./docs/05_DEPLOYMENT_MAINTENANCE.md): Deployment instructions for Vercel, maintenance procedures, and disaster recovery.
