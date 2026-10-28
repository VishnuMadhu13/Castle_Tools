# 7. Pages & UI Screens

All pages use the **dark theme** (slate-950 background, indigo accents) via shadcn/ui + Tailwind CSS.

---

## Page Route Table

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Guest / User | Landing page with "Sign in with Google" button. Redirects to `/dashboard` if already logged in. |
| `/dashboard` | User | Tools grid — card list of all `isActive = true` tools with search. |
| `/dashboard/tools/[id]` | User | Tool detail — shows tool info, "Send to My Email" button, and inline credential display after send. Can be a modal triggered from the dashboard instead. |
| `/admin` | Admin | Overview stats: total tools, total users, total credential requests. |
| `/admin/tools` | Admin | Tools management table with Add / Edit / Soft-Delete actions. |
| `/admin/tools/new` | Admin | Form to create a new tool (name, description, icon URL, isActive). |
| `/admin/tools/[id]/edit` | Admin | Form to edit tool fields and attach/update credentials (username + password). |
| `/admin/users` | Admin | User list table with name, email, avatar, isAdmin badge, joined date, and Edit button to toggle isAdmin. |

---

## Key UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ToolCard` | `components/ToolCard.tsx` | Displays tool name, icon, description, and "Get Credentials" button |
| `CredentialModal` | `components/CredentialModal.tsx` | Modal/sheet for sending credentials and showing them inline |
| `AdminSidebar` | `components/AdminSidebar.tsx` | Navigation sidebar for all `/admin` pages |
| `UserEditDialog` | `components/UserEditDialog.tsx` | Dialog to toggle `isAdmin` for a user |
| `ToolForm` | `components/ToolForm.tsx` | Shared form for create/edit tool |

---

## UI Flow Diagram

```
[/] ──── Sign in with Google ────► [NextAuth Google OAuth]
                                          │
                                    ◄─────┘ (success)
                                          │
                                    [/dashboard]
                                          │
                            ┌─────────────┴──────────────┐
                      Browse Tools                  Search Tools
                            │
                    Click "Get Credentials"
                            │
                    [Modal / /tools/[id]]
                            │
                    "Send to My Email"
                            │
                  ┌──────────┴──────────┐
             Gmail API send         Show inline
          (Confidential Mode)      credentials
          expires in 24hrs              │
                                  [Success toast]
```
