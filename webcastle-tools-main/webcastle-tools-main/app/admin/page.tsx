import { db } from '@/db'
import { tools, users, credentialRequests } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, Users, Mail } from 'lucide-react'

export default async function AdminOverviewPage() {
  const [toolCount] = await db.select({ count: count() }).from(tools).where(eq(tools.isActive, true))
  const [userCount] = await db.select({ count: count() }).from(users)
  const [requestCount] = await db.select({ count: count() }).from(credentialRequests)

  const stats = [
    { label: 'Active Tools', value: toolCount.count, icon: Wrench, color: 'text-indigo-400' },
    { label: 'Registered Users', value: userCount.count, icon: Users, color: 'text-emerald-400' },
    { label: 'Credential Requests', value: requestCount.count, icon: Mail, color: 'text-amber-400' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
