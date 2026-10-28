# 6. API Routes

All routes live under `app/api/`. Session checks are performed server-side on every request.

---

## Route Table

| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/auth/[...nextauth]` | GET / POST | NextAuth handler — Google OAuth login/callback/signout | None |
| `/api/tools` | GET | List all active tools | User |
| `/api/tools` | POST | Create a new tool | Admin |
| `/api/tools/[id]` | PATCH | Update tool fields (name, description, iconUrl, isActive) | Admin |
| `/api/tools/[id]` | DELETE | Soft-delete tool (sets `isActive = false`) | Admin |
| `/api/credentials/[toolId]` | GET | Get credential (username + decrypted password) for a tool | Admin |
| `/api/credentials/[toolId]` | POST | Set or update credential for a tool | Admin |
| `/api/send-credentials/[toolId]` | POST | Decrypt credential, send via Gmail Confidential Mode to session user's email, log request | User |
| `/api/admin/users` | GET | List all registered users | Admin |
| `/api/admin/users/[id]` | PATCH | Update `isAdmin` flag for a user (cannot self-demote) | Admin |

---

## Auth Enforcement

- **User** routes: check `session.user` exists via `auth()` from NextAuth. Return `401` if not.
- **Admin** routes: additionally check `session.user.isAdmin === true`. Return `403` if not.

```ts
// Example admin route guard
const session = await auth()
if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })
```
