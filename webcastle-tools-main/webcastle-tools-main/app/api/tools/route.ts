import { auth } from '@/lib/auth'
import { db } from '@/db'
import { tools, credentials, categories, tags, toolTags } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { z } from 'zod'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const typeFilter = url.searchParams.get('type')
  const categoryIdFilter = url.searchParams.get('categoryId')

  const conditions = [eq(tools.isActive, true)]
  if (typeFilter === 'tool' || typeFilter === 'document') {
    conditions.push(eq(tools.type, typeFilter))
  }
  if (categoryIdFilter) {
    conditions.push(eq(tools.categoryId, categoryIdFilter))
  }

  const rows = await db
    .select({
      id:           tools.id,
      name:         tools.name,
      description:  tools.description,
      iconUrl:      tools.iconUrl,
      isActive:     tools.isActive,
      type:         tools.type,
      url:          tools.url,
      instructions: tools.instructions,
      categoryId:   tools.categoryId,
      categoryName: categories.name,
      createdAt:    tools.createdAt,
      updatedAt:    tools.updatedAt,
      hasCredentials: credentials.id,
    })
    .from(tools)
    .leftJoin(categories, eq(tools.categoryId, categories.id))
    .leftJoin(credentials, eq(tools.id, credentials.toolId))
    .where(and(...conditions))
    .orderBy(tools.name)

  // Gather tool IDs to fetch tags
  const toolIds = rows.map((r) => r.id)
  let tagsByTool: Record<string, Array<{ id: string; name: string; color: string }>> = {}

  if (toolIds.length > 0) {
    const tagRows = await db
      .select({
        toolId: toolTags.toolId,
        tagId:  tags.id,
        name:   tags.name,
        color:  tags.color,
      })
      .from(toolTags)
      .innerJoin(tags, eq(toolTags.tagId, tags.id))
      .where(inArray(toolTags.toolId, toolIds))

    for (const tr of tagRows) {
      if (!tagsByTool[tr.toolId]) tagsByTool[tr.toolId] = []
      tagsByTool[tr.toolId].push({ id: tr.tagId, name: tr.name, color: tr.color })
    }
  }

  const result = rows.map((r) => ({
    id:             r.id,
    name:           r.name,
    description:    r.description,
    iconUrl:        r.iconUrl,
    isActive:       r.isActive,
    type:           r.type,
    url:            r.url,
    instructions:   r.instructions,
    categoryId:     r.categoryId,
    categoryName:   r.categoryName ?? null,
    hasCredentials: r.hasCredentials !== null,
    tags:           tagsByTool[r.id] ?? [],
  }))

  return Response.json(result)
}

const createToolSchema = z.object({
  name:         z.string().min(1),
  description:  z.string().optional(),
  iconUrl:      z.string().url().optional().or(z.literal('')),
  isActive:     z.boolean().optional().default(true),
  type:         z.enum(['tool', 'document']).optional().default('tool'),
  url:          z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  categoryId:   z.string().uuid().optional().nullable(),
  tagIds:       z.array(z.string().uuid()).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createToolSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 })

  const { tagIds, ...toolData } = parsed.data

  const [tool] = await db
    .insert(tools)
    .values({
      name:         toolData.name,
      description:  toolData.description,
      iconUrl:      toolData.iconUrl || null,
      isActive:     toolData.isActive ?? true,
      type:         toolData.type ?? 'tool',
      url:          toolData.url || null,
      instructions: toolData.instructions || null,
      categoryId:   toolData.categoryId ?? null,
    })
    .returning()

  if (tagIds && tagIds.length > 0) {
    await db.insert(toolTags).values(tagIds.map((tagId) => ({ toolId: tool.id, tagId })))
  }

  return Response.json(tool, { status: 201 })
}
