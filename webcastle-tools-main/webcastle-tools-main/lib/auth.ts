import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user
      const isAdmin = session?.user?.isAdmin
      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')

      if (isDashboardRoute && !isLoggedIn) return false
      if (isAdminRoute && !isLoggedIn) return false
      if (isAdminRoute && !isAdmin) return Response.redirect(new URL('/', nextUrl))
      return true
    },
    async signIn({ user, account }) {
      if (!user.email) return false
      // account.providerAccountId is the Google sub claim in NextAuth v5
      const googleId = account?.providerAccountId ?? user.id ?? ''
      try {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        })
        if (!existing) {
          await db.insert(users).values({
            googleId,
            email: user.email,
            name: user.name ?? user.email,
            image: user.image,
          })
        }
        return true
      } catch (err) {
        console.error('[auth] signIn error:', err)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          })
          token.isAdmin = dbUser?.isAdmin ?? false
          token.id = dbUser?.id
        } catch (err) {
          console.error('[auth] jwt error:', err)
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.isAdmin = (token.isAdmin as boolean) ?? false
      session.user.id = token.id as string
      return session
    },
  },
})
