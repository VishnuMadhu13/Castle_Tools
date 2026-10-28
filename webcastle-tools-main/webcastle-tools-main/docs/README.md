# CredVault — Software Requirements Specification

> **Version:** 1.0 · **Date:** May 28, 2026  
> **Stack:** Next.js 15 · Bun · NextAuth.js v5 · Google OAuth · Drizzle ORM · PostgreSQL · shadcn/ui

---

## Documents

| # | File | Contents |
|---|------|----------|
| 1 | [01-introduction.md](./01-introduction.md) | Purpose, scope, definitions, tech stack |
| 2 | [02-overall-description.md](./02-overall-description.md) | User classes, assumptions & constraints |
| 3 | [03-functional-requirements.md](./03-functional-requirements.md) | Auth, dashboard, credential flow, admin panel |
| 4 | [04-non-functional-requirements.md](./04-non-functional-requirements.md) | Security, performance, usability |
| 5 | [05-database-schema.md](./05-database-schema.md) | All Drizzle/Postgres tables |
| 6 | [06-api-routes.md](./06-api-routes.md) | API endpoints with methods & auth levels |
| 7 | [07-pages-and-ui.md](./07-pages-and-ui.md) | Next.js page routes & UI screens |
| 8 | [08-folder-structure.md](./08-folder-structure.md) | Full project directory layout |
| 9 | [09-environment-variables.md](./09-environment-variables.md) | `.env.example` reference |
| 10 | [10-gmail-confidential-mode.md](./10-gmail-confidential-mode.md) | Gmail API implementation notes |
| 11 | [11-middleware-and-auth-guard.md](./11-middleware-and-auth-guard.md) | Route protection patterns |
| 12 | [12-implementation-plan.md](./12-implementation-plan.md) | 10-phase build sequence |
| 13 | [13-future-scope.md](./13-future-scope.md) | Open items & future features |

---

## Quick Summary

CredVault is a web platform where authenticated users (Google login) can browse registered tools and request credentials for them. Credentials are delivered to the user's email via **Gmail Confidential Mode** (expires in 24 hours) and also displayed inline after sending.

An **admin panel** at `/admin` (gated by `isAdmin` flag) lets admins manage tools, attach credentials, and toggle admin access for users.
