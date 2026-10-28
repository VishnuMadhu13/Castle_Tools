# 12. Implementation Plan

10 phases from setup to deployment.

---

## Phase Overview

| # | Phase | Tasks | Deliverable |
|---|-------|-------|-------------|
| 1 | Project Setup | Init Next.js 15 with Bun, configure Tailwind + shadcn/ui dark theme, Drizzle + PostgreSQL, `.env` setup | Running dev server with dark theme |
| 2 | Authentication | NextAuth with Google provider, user upsert on first login, session types extended with `isAdmin` and `id` | Google login → `/dashboard` redirect working |
| 3 | Database Schema | Write `schema.ts` (all 4 tables), run `drizzle-kit generate` + `drizzle-kit migrate` | All DB tables created |
| 4 | Tools Dashboard | `GET /api/tools`, `/dashboard` page with `ToolCard` grid, real-time search filter | Tools list UI live |
| 5 | Credential Send | `POST /api/send-credentials`, Gmail API integration, Confidential Mode, AES encrypt/decrypt, inline credential view in modal | Email send working end-to-end |
| 6 | Admin – Tools | `/admin/tools` CRUD pages, add/edit forms, soft-delete, credential attachment | Admin tool management done |
| 7 | Admin – Users | `/admin/users` list, `isAdmin` toggle dialog, self-demotion guard | User management done |
| 8 | Middleware | Route guards via `middleware.ts` + `/admin/layout.tsx`, TypeScript session augmentation | All routes protected |
| 9 | Polish | Error handling, toast notifications, loading skeletons, empty states, responsive layout, form validation | Production-ready UI |
| 10 | Deploy | Set env vars on host, run migrations on production DB, deploy to Vercel / Railway | Live application |

---

## Detailed Phase Breakdown

### Phase 1 — Project Setup
```bash
bun create next-app credvault --typescript --tailwind --app
cd credvault
bun add drizzle-orm postgres
bun add -d drizzle-kit
bun add next-auth@beta
bunx shadcn@latest init   # choose dark theme
```
- Set `darkMode: 'class'` in `tailwind.config.ts`
- Add `dark` class to `<html>` in root layout

---

### Phase 2 — Authentication
- Configure `lib/auth.ts` with Google provider
- Extend `next-auth.d.ts` to add `isAdmin: boolean` and `id: string` to session
- Create `/api/auth/[...nextauth]/route.ts`
- Protect `/dashboard` in `middleware.ts`
- Build the `/` landing page with shadcn `Button` + Google logo

---

### Phase 3 — Database Schema
- Write all 4 tables in `db/schema.ts`
- Configure `drizzle.config.ts`
- Run `bun drizzle-kit generate` and `bun drizzle-kit migrate`

---

### Phase 4 — Tools Dashboard
- `GET /api/tools` — query all `isActive = true` tools
- `/dashboard/page.tsx` — fetch tools, render `ToolCard` grid
- `ToolCard` component with shadcn `Card`
- Search input with `useState` filter

---

### Phase 5 — Credential Send
- `lib/crypto.ts` — AES-256-GCM encrypt/decrypt
- `lib/gmail.ts` — Gmail API confidential send helper
- `POST /api/send-credentials/[toolId]`:
  1. Auth check
  2. Fetch credential from DB → decrypt password
  3. Send via Gmail Confidential Mode
  4. Log to `credentialRequests`
  5. Return `{ username, password }` to client
- `CredentialModal` — send button + inline display after response

---

### Phase 6 — Admin Tools Management
- `/admin/tools` — table with shadcn `DataTable`
- `/admin/tools/new` — `ToolForm` with create API call
- `/admin/tools/[id]/edit` — `ToolForm` pre-filled + credential section
- Soft-delete with confirmation dialog

---

### Phase 7 — Admin User Management
- `/admin/users` — user table with avatar, email, isAdmin badge
- `UserEditDialog` — toggle `isAdmin` with `PATCH /api/admin/users/[id]`
- Guard: if `id === session.user.id`, disable the toggle

---

### Phase 8 — Middleware & Guards
- `middleware.ts` — redirect unauthenticated to `/`
- `/admin/layout.tsx` — redirect non-admins to `/`
- All API routes return `401` / `403` appropriately

---

### Phase 9 — Polish
- shadcn `Toaster` + `toast()` calls for all async operations
- Skeleton loaders for tools grid and user list
- `zod` schema validation on all forms
- Mobile-responsive admin sidebar (collapsible)
- Error boundaries

---

### Phase 10 — Deploy
```bash
# Production migrations
DATABASE_URL=<prod-url> bun drizzle-kit migrate

# Deploy
vercel --prod
# or
railway up
```
- Set all env vars in hosting dashboard
- Verify Google OAuth redirect URIs include production URL
- Test Gmail send end-to-end on production
