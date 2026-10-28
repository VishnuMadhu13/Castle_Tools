import { auth } from '@/lib/auth'
import { db } from '@/db'
import { tools, toolTags } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateToolSchema = z.object({
  name:         z.string().min(1).optional(),
  description:  z.string().optional(),
  iconUrl:      z.string().optional(),
  isActive:     z.boolean().optional(),
  type:         z.enum(['tool', 'document']).optional(),
  url:          z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  categoryId:   z.string().uuid().optional().nullable(),
  tagIds:       z.array(z.string().uuid()).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateToolSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  const { tagIds, ...toolData } = parsed.data

  const [updated] = await db
    .update(tools)
    .set({ ...toolData, updatedAt: new Date() })
    .where(eq(tools.id, id))
    .returning()

  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })

  if (tagIds !== undefined) {
    await db.delete(toolTags).where(eq(toolTags.toolId, id))
    if (tagIds.length > 0) {
      await db.insert(toolTags).values(tagIds.map((tagId) => ({ toolId: id, tagId })))
    }
  }

  return Response.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const [updated] = await db
    .update(tools)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(tools.id, id))
    .returning()

  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ success: true })
}
