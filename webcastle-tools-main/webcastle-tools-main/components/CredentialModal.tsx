'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'

interface ToolTag {
  id: string
  name: string
  color: string
}

interface Tool {
  id: string
  name: string
  type?: string
  description?: string | null
  iconUrl?: string | null
  url?: string | null
  instructions?: string | null
  hasCredentials?: boolean
  tags?: ToolTag[]
}

export function CredentialModal({
  open,
  onOpenChange,
  tool,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tool: Tool
}) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const itemLabel = tool.type === 'document' ? 'Document' : 'Tool'

  async function handleSend() {
    setLoading(true)
    try {
      const res = await fetch(`/api/send-credentials/${tool.id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to send credentials')
        return
      }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(() => setSent(false), 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{tool.name}</DialogTitle>
            {tool.type && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                  tool.type === 'document'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-indigo-500 text-indigo-400'
                }`}
              >
                {itemLabel}
              </span>
            )}
          </div>
          {tool.description && (
            <DialogDescription>{tool.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Instructions */}
          {tool.instructions && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Instructions</p>
              <div className="rounded-md bg-secondary p-3 max-h-40 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans">{tool.instructions}</pre>
              </div>
            </div>
          )}

          {/* URL / Open button */}
          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-secondary hover:bg-secondary/80 px-4 py-2 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open {itemLabel}
            </a>
          )}

          {/* Credentials section */}
          {tool.hasCredentials !== false && (
            !sent ? (
              <Button onClick={handleSend} disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><Mail className="mr-2 h-4 w-4" /> Send Credentials to My Email</>
                )}
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base">Credentials sent!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check your email for the secure link.<br />
                    The link expires in 24 hours.
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={handleClose}>
                  Done
                </Button>
              </div>
            )
          )}

          {/* If nothing useful to show */}
          {!tool.url && tool.hasCredentials === false && !tool.instructions && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No additional details configured for this {itemLabel.toLowerCase()}.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
