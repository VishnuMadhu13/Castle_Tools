'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Tool {
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
  isActive: boolean
  type: string
  categoryId?: string | null
  categoryName?: string | null
  createdAt: Date
}

export function AdminToolsClient({
  tools,
  toolsWithCreds,
}: {
  tools: Tool[]
  toolsWithCreds: string[]
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'tool' | 'document'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const credsSet = new Set(toolsWithCreds)

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/tools/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete tool')
      toast.success('Tool deactivated')
      router.refresh()
    } catch {
      toast.error('Failed to deactivate tool')
    } finally {
      setDeleting(null)
    }
  }

  // Collect unique categories for filter
  const categoryOptions = Array.from(
    new Map(
      tools
        .filter((t) => t.categoryId && t.categoryName)
        .map((t) => [t.categoryId!, t.categoryName!])
    ).entries()
  )

  const filtered = tools.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false
    return true
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {(['all', 'tool', 'document'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={typeFilter === f ? 'default' : 'outline'}
              onClick={() => setTypeFilter(f)}
              className="capitalize"
            >
              {f === 'all' ? 'All' : f === 'tool' ? 'Tools' : 'Documents'}
            </Button>
          ))}
          {categoryOptions.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground ml-2">Category:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-36 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categoryOptions.map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        <Button asChild>
          <Link href="/admin/tools/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Tool
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Credentials</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  No tools found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        tool.type === 'document'
                          ? 'border-violet-500 text-violet-400'
                          : 'border-indigo-500 text-indigo-400'
                      }
                    >
                      {tool.type === 'document' ? 'Document' : 'Tool'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {tool.categoryName ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {tool.description ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.isActive ? 'default' : 'secondary'}>
                      {tool.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={credsSet.has(tool.id) ? 'default' : 'outline'}>
                      {credsSet.has(tool.id) ? 'Set' : 'Missing'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/tools/${tool.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={deleting === tool.id}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate {tool.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will hide the tool from the dashboard. Credentials are preserved.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(tool.id)}>Deactivate</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
