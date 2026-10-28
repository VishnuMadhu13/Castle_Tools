import { auth } from '@/lib/auth'
import { db } from '@/db'
import { tags } from '@/db/schema'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const all = await db.select().from(tags).orderBy(tags.name)
  return Response.json(all)
}

const createTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional().default('#6366f1'),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createTagSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  const [tag] = await db
    .insert(tags)
    .values({ name: parsed.data.name, color: parsed.data.color })
    .returning()

  return Response.json(tag, { status: 201 })
}
