import { db } from '@/db'
import { users } from '@/db/schema'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminUsersClient } from '@/components/AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user) redirect('/')

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <AdminUsersClient users={allUsers} currentUserId={session.user.id} />
    </div>
  )
}
