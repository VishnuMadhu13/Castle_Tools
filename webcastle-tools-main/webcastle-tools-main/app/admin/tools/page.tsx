import { db } from '@/db'
import { tools, credentials, categories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { AdminToolsClient } from '@/components/AdminToolsClient'

export default async function AdminToolsPage() {
  const allTools = await db
    .select({
      id:           tools.id,
      name:         tools.name,
      description:  tools.description,
      iconUrl:      tools.iconUrl,
      isActive:     tools.isActive,
      type:         tools.type,
      categoryId:   tools.categoryId,
      categoryName: categories.name,
      createdAt:    tools.createdAt,
    })
    .from(tools)
    .leftJoin(categories, eq(tools.categoryId, categories.id))
    .orderBy(tools.createdAt)

  const allCreds = await db.select({ toolId: credentials.toolId }).from(credentials)
  const toolsWithCreds = new Set(allCreds.map((c) => c.toolId))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tools Management</h1>
      </div>
      <AdminToolsClient tools={allTools} toolsWithCreds={Array.from(toolsWithCreds)} />
    </div>
  )
}
