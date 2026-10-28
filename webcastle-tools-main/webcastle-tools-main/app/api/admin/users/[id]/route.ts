import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateUserSchema = z.object({
  isAdmin: z.boolean(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  if (id === session.user.id) {
    return Response.json({ error: 'Cannot modify your own admin status.' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  const [updated] = await db
    .update(users)
    .set({ isAdmin: parsed.data.isAdmin })
    .where(eq(users.id, id))
    .returning()

  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(updated)
}
