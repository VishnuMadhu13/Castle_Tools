# 4. Non-Functional Requirements

---

## 4.1 Security

- Passwords stored in the DB shall be **encrypted at rest using AES-256-GCM** with a server-side symmetric key.
  > ⚠️ Passwords must be **encrypted (not hashed)** because they need to be readable when sending via email. Use `CREDENTIAL_ENCRYPTION_KEY` from env.
- All API routes perform **session checks server-side** before processing.
- `/admin` routes perform `isAdmin` check via Next.js middleware **and** layout server components.
- **HTTPS enforced** in production.
- NextAuth **CSRF protection** enabled by default.
- Gmail OAuth tokens stored securely in environment variables (never in DB or client).

---

## 4.2 Performance

- Dashboard tool list renders within **500ms** for up to 500 tools.
- Email dispatch (Gmail API call) completes within **5 seconds**.
- Admin panel user list paginates if users exceed 100.

---

## 4.3 Usability

- **Dark theme** applied globally via shadcn/ui CSS variables:
  - Background: `slate-950`
  - Card: `slate-900`
  - Accent: `indigo-500`
  - Text: `slate-100`
- **Responsive layout** — works on desktop and mobile browsers.
- All shadcn/ui components follow **ARIA accessibility standards**.
- Loading states shown for all async operations (skeleton loaders / spinners).
- Toast notifications for success and error states.

---

## 4.4 Maintainability

- All DB migrations managed via **Drizzle Kit** (`bun drizzle-kit generate`, `bun drizzle-kit migrate`).
- Environment variables documented in `.env.example`.
- TypeScript strict mode enabled throughout.
- All components co-located with their routes following Next.js App Router conventions.
