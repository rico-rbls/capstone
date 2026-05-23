# Library System — Folder Structure

```
library-system/
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                       ← Type-check + lint gate (blocks merge on failure)
│       ├── deploy-supabase.yml
│       └── deploy-web.yml
├── apps/
│   ├── mobile/
│   │   ├── .env                         ← git-ignored (real secrets)
│   │   ├── .env.example                 ← committed template (no secrets)
│   │   ├── app.json
│   │   ├── assets/
│   │   │   ├── fonts/
│   │   │   └── images/
│   │   ├── babel.config.js
│   │   ├── eas.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── app/
│   │       │   ├── _layout.tsx
│   │       │   ├── (auth)/
│   │       │   │   ├── _layout.tsx
│   │       │   │   ├── login.tsx
│   │       │   │   └── register.tsx
│   │       │   ├── (tabs)/
│   │       │   │   ├── _layout.tsx
│   │       │   │   ├── index.tsx
│   │       │   │   ├── my-loans.tsx
│   │       │   │   ├── my-qr.tsx
│   │       │   │   ├── profile.tsx
│   │       │   │   └── search.tsx
│   │       │   ├── book/
│   │       │   │   └── [id].tsx
│   │       │   └── scan/
│   │       │       └── index.tsx
│   │       ├── components/
│   │       │   ├── __tests__/           ← Unit tests (Jest)
│   │       │   ├── book-card/
│   │       │   │   ├── index.tsx
│   │       │   │   └── availability-pill.tsx
│   │       │   ├── empty-state.tsx
│   │       │   ├── loading-spinner.tsx
│   │       │   ├── qr-display.tsx
│   │       │   └── qr-display.test.ts
│   │       ├── constants/
│   │       │   ├── routes.ts
│   │       │   └── theme.ts
│   │       ├── hooks/
│   │       │   ├── __tests__/           ← Unit tests (Jest)
│   │       │   │   ├── use-attendance.test.ts
│   │       │   │   ├── use-auth.test.ts
│   │       │   │   ├── use-books.test.ts
│   │       │   │   ├── use-fines.test.ts
│   │       │   │   └── use-loans.test.ts
│   │       │   ├── use-attendance.ts
│   │       │   ├── use-auth.ts
│   │       │   ├── use-books.ts
│   │       │   ├── use-fines.ts
│   │       │   └── use-loans.ts
│   │       ├── lib/
│   │       │   ├── notifications.ts
│   │       │   ├── query-client.ts
│   │       │   └── supabase.ts
│   │       ├── screens/
│   │       │   ├── book-detail/
│   │       │   │   ├── index.tsx
│   │       │   │   ├── availability-badge.tsx
│   │       │   │   └── borrow-action-bar.tsx
│   │       │   ├── home/
│   │       │   │   ├── index.tsx
│   │       │   │   ├── announcement-banner.tsx
│   │       │   │   └── loan-summary-card.tsx
│   │       │   ├── my-loans/
│   │       │   │   ├── index.tsx
│   │       │   │   ├── loan-item.tsx
│   │       │   │   └── overdue-warning.tsx
│   │       │   ├── my-qr/
│   │       │   │   └── index.tsx
│   │       │   ├── profile/
│   │       │   │   ├── index.tsx
│   │       │   │   └── fine-item.tsx
│   │       │   ├── scan/
│   │       │   │   ├── index.tsx
│   │       │   │   ├── scan-overlay.tsx
│   │       │   │   └── scan-result-sheet.tsx
│   │       │   └── search/
│   │       │       ├── index.tsx
│   │       │       ├── book-result-item.tsx
│   │       │       └── filter-bar.tsx
│   │       └── utils/
│   │           ├── calc-fine.ts
│   │           ├── format-date.ts
│   │           └── format-date.test.ts
│   └── web/
│       ├── .env                         ← git-ignored (real secrets)
│       ├── .env.example                 ← committed template (no secrets)
│       ├── vercel.json
│       ├── playwright.config.ts
│       ├── e2e/                          ← End-to-End tests (Playwright)
│       │   └── generate-report.spec.ts
│       └── src/
│           ├── QRScanner.ts
│           ├── components/
│           │   ├── __tests__/           ← Unit tests (Jest)
│           │   ├── AttendanceScannerPanel.tsx
│           │   ├── BookQrBatchPrint.tsx
│           │   ├── BookTable.tsx
│           │   ├── LoanCheckoutModal.tsx
│           │   └── SessionManager.tsx
│           ├── hooks/
│           │   ├── __tests__/           ← Unit tests (Jest)
│           │   ├── useAdminBooks.ts
│           │   ├── useAttendanceSessions.ts
│           │   ├── useLoans.ts
│           │   └── useQrScanner.ts
│           └── pages/
│               ├── AttendancePage.tsx
│               ├── BooksPage.tsx
│               ├── DashboardPage.tsx
│               ├── LoansPage.tsx
│               ├── MembersPage.tsx
│               └── ReportsPage.tsx
├── packages/
│   ├── api/
│   │   └── src/
│   │       ├── attendance.ts
│   │       ├── books.ts
│   │       ├── client.ts
│   │       ├── fines.ts
│   │       ├── loans.ts
│   │       ├── members.ts
│   │       ├── query-keys.ts
│   │       └── reservations.ts
│   ├── qr/
│   │   └── src/
│   │       ├── generate.ts
│   │       ├── parse.ts
│   │       └── payload.ts
│   ├── types/
│   │   └── src/
│   │       ├── database.ts
│   │       ├── mobile.ts
│   │       └── schema.ts
│   ├── shared-utils/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── calculatePenalty.ts
│   │       ├── formatDateTz.ts
│   │       ├── generateTotpHash.ts
│   │       └── __tests__/
│   │           ├── calculatePenalty.test.ts
│   │           ├── formatDateTz.test.ts
│   │           └── generateTotpHash.test.ts
│   ├── ui/
│   └── utils/
│       └── src/
│           ├── dates.ts
│           └── fines.ts
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   ├── functions/
│   │   ├── deno.json                    ← Import map: resolves @library-system/shared-utils for Deno
│   │   ├── _shared/                     ← Shared utilities for all Edge Functions
│   │   │   ├── cors.ts
│   │   │   └── supabase-client.ts
│   │   ├── generate-book-qr/
│   │   │   └── index.ts                 ← Generates QR payload for book labels
│   │   ├── generate-member-qr/
│   │   │   └── index.ts                 ← Generates signed TOTP QR for members
│   │   ├── mark-overdue-loans/
│   │   │   └── index.ts                 ← Cron: batch-marks loans as overdue
│   │   ├── process-return/
│   │   │   └── index.ts                 ← Processes return, calculates fines
│   │   └── send-overdue-reminders/
│   │       └── index.ts                 ← Sends email/push to overdue members
│   └── migrations/
│       └── initial_schema.sql
├── pnpm-workspace.yaml
└── turbo.json
```
