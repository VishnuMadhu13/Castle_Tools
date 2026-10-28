# 2. Overall Description

## 2.1 Product Perspective

CredVault is a standalone Next.js web application. It integrates with:

- **Google OAuth** for identity (via NextAuth.js)
- **Gmail API** for secure credential email delivery
- **PostgreSQL** (via Drizzle ORM) for persistence

There is no mobile app; the web UI is fully responsive.

---

## 2.2 User Classes

| Role | Description |
|------|-------------|
| **Guest** | Unauthenticated visitor — can only see the login page (`/`) |
| **User** | Authenticated via Google — can browse tools and request credentials |
| **Admin** | User with `isAdmin = true` — additionally has access to `/admin` |

---

## 2.3 Assumptions & Constraints

- The platform uses Google Workspace or personal Gmail for credential email delivery
- Gmail API Confidential Mode requires OAuth 2.0 scope: `gmail.send`
- All timestamps stored and computed in **UTC**
- Only **one credential set per tool** is stored at a time (admin can update it)
- The dark theme uses a slate/indigo color palette via shadcn/ui CSS variables
- The recipient must open the confidential email via Gmail or the Gmail mobile app
