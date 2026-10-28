# 11. Middleware & Auth Guard

---

## 11.1 Next.js Middleware (`middleware.ts`)

Protects all `/dashboard` and `/admin` routes at the edge — unauthenticated users are redirected to `/`.

```ts
// middleware.ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
}
```

---

## 11.2 Admin Layout Guard (`app/admin/layout.tsx`)

A secondary check in the server component layout ensures only `isAdmin = true` users can access any admin page. This runs on every admin page render.

```ts
// app/admin/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/')
  if (!session.user.isAdmin) redirect('/')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

---

## 11.3 NextAuth Config (`lib/auth.ts`)

The `isAdmin` field is attached to the JWT and session so it's available in both server and client components.

```ts
// lib/auth.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      // Upsert user on first login
      const existing = await db.query.users.findFirst({
        where: eq(users.email, user.email!),
      })
      if (!existing) {
        await db.insert(users).values({
          googleId: user.id!,
          email: user.email!,
          name: user.name!,
          image: user.image,
        })
      }
      return true
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        })
        token.isAdmin = dbUser?.isAdmin ?? false
        token.id = dbUser?.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin as boolean
      session.user.id = token.id as string
      return session
    },
  },
})
```

---

## 11.4 API Route Guard Pattern

```ts
// Any admin API route
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  // ... handler logic
}
```
