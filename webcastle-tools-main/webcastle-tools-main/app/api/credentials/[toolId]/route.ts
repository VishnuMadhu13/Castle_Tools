import { auth } from '@/lib/auth'
import { db } from '@/db'
import { credentials } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { encrypt, decrypt } from '@/lib/crypto'
import { z } from 'zod'

export async function GET(_req: Request, { params }: { params: Promise<{ toolId: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { toolId } = await params
  const [cred] = await db.select().from(credentials).where(eq(credentials.toolId, toolId))
  if (!cred) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({
    id: cred.id,
    toolId: cred.toolId,
    username: cred.username ?? null,
    password: cred.passwordEnc ? decrypt(cred.passwordEnc) : null,
  })
}

const upsertCredSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
})

export async function POST(req: Request, { params }: { params: Promise<{ toolId: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { toolId } = await params
  const body = await req.json()
  const parsed = upsertCredSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  // Only save if at least one field provided
  if (!parsed.data.username && !parsed.data.password) {
    return Response.json({ error: 'At least username or password must be provided' }, { status: 400 })
  }

  const passwordEnc = parsed.data.password ? encrypt(parsed.data.password) : undefined

  const existing = await db.select().from(credentials).where(eq(credentials.toolId, toolId))
  if (existing.length > 0) {
    const updateData: { username?: string; passwordEnc?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    }
    if (parsed.data.username !== undefined) updateData.username = parsed.data.username
    if (passwordEnc !== undefined) updateData.passwordEnc = passwordEnc

    const [updated] = await db
      .update(credentials)
      .set(updateData)
      .where(eq(credentials.toolId, toolId))
      .returning()
    return Response.json(updated)
  }

  const [created] = await db
    .insert(credentials)
    .values({
      toolId,
      username: parsed.data.username ?? null,
      passwordEnc: passwordEnc ?? null,
    })
    .returning()
  return Response.json(created, { status: 201 })
}
