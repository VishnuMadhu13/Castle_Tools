# 5. Database Schema

> ORM: **Drizzle ORM** · Database: **PostgreSQL**

---

## 5.1 `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | Internal user ID |
| `googleId` | `text` | UNIQUE, NOT NULL | Google OAuth `sub` claim |
| `email` | `text` | UNIQUE, NOT NULL | User's Google email |
| `name` | `text` | NOT NULL | Display name from Google |
| `image` | `text` | NULLABLE | Profile picture URL |
| `isAdmin` | `boolean` | NOT NULL, default `false` | Admin access flag |
| `createdAt` | `timestamp` | NOT NULL, default `now()` | Account creation time |

---

## 5.2 `tools`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | Tool ID |
| `name` | `text` | NOT NULL | Tool display name |
| `description` | `text` | NULLABLE | Short description shown on card |
| `iconUrl` | `text` | NULLABLE | URL for tool logo/icon |
| `isActive` | `boolean` | NOT NULL, default `true` | Visible on dashboard when `true` |
| `createdAt` | `timestamp` | NOT NULL, default `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NOT NULL, default `now()` | Last update timestamp |

---

## 5.3 `credentials`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | Credential ID |
| `toolId` | `uuid` | FK → `tools.id`, NOT NULL | Associated tool |
| `username` | `text` | NOT NULL | Login username or email |
| `passwordEnc` | `text` | NOT NULL | AES-256-GCM encrypted password |
| `createdAt` | `timestamp` | NOT NULL, default `now()` | Creation timestamp |
| `updatedAt` | `timestamp` | NOT NULL, default `now()` | Last update timestamp |

> The `passwordEnc` field stores the encrypted ciphertext. Decryption happens server-side in `lib/crypto.ts` using `CREDENTIAL_ENCRYPTION_KEY` before sending via Gmail.

---

## 5.4 `credentialRequests` (audit log)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK | Request ID |
| `userId` | `uuid` | FK → `users.id`, NOT NULL | Who requested |
| `toolId` | `uuid` | FK → `tools.id`, NOT NULL | Which tool |
| `requestedAt` | `timestamp` | NOT NULL, default `now()` | When the email was sent |
| `status` | `text` | NOT NULL, default `'sent'` | `sent` \| `failed` |

---

## 5.5 Drizzle Schema (Reference)

```ts
// db/schema.ts
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  googleId:  text('google_id').unique().notNull(),
  email:     text('email').unique().notNull(),
  name:      text('name').notNull(),
  image:     text('image'),
  isAdmin:   boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const tools = pgTable('tools', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull(),
  description: text('description'),
  iconUrl:     text('icon_url'),
  isActive:    boolean('is_active').notNull().default(true),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

export const credentials = pgTable('credentials', {
  id:          uuid('id').primaryKey().defaultRandom(),
  toolId:      uuid('tool_id').notNull().references(() => tools.id),
  username:    text('username').notNull(),
  passwordEnc: text('password_enc').notNull(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

export const credentialRequests = pgTable('credential_requests', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id),
  toolId:      uuid('tool_id').notNull().references(() => tools.id),
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
  status:      text('status').notNull().default('sent'),
})
```
