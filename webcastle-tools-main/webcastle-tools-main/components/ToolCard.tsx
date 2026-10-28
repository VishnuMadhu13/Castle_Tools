'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, FileText, ExternalLink } from 'lucide-react'
import { CredentialModal } from '@/components/CredentialModal'

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
  categoryName?: string | null
  tags?: ToolTag[]
  hasCredentials?: boolean
}

export function ToolCard({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false)
  const isDocument = tool.type === 'document'
  const itemLabel = isDocument ? 'Document' : 'Tool'

  const showOpenButton = !!tool.url
  const showCredButton = tool.hasCredentials === true

  return (
    <>
      <Card
        className="bg-card border-border flex flex-col hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <CardHeader className="flex flex-row items-start gap-4 pb-2">
          <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
            {tool.iconUrl ? (
              <Image src={tool.iconUrl} alt={tool.name} width={48} height={48} className="object-contain" />
            ) : isDocument ? (
              <FileText className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Wrench className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base truncate">{tool.name}</CardTitle>
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium border shrink-0 ${
                  isDocument
                    ? 'border-violet-500/60 text-violet-400'
                    : 'border-indigo-500/60 text-indigo-400'
                }`}
              >
                {itemLabel}
              </span>
            </div>
            {tool.categoryName && (
              <p className="text-xs text-muted-foreground mt-0.5">{tool.categoryName}</p>
            )}
          </div>
        </CardHeader>

        {tool.description && (
          <CardContent className="pt-0 pb-2 flex-1">
            <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
          </CardContent>
        )}

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="px-6 pb-2 flex flex-wrap gap-1">
            {tool.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {showOpenButton || showCredButton ? (
          <CardFooter className="pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {showOpenButton && (
              <a
                href={tool.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary hover:bg-secondary/80 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                Open {itemLabel}
              </a>
            )}
            {showCredButton && (
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(true)
                }}
              >
                Get Credentials
              </Button>
            )}
          </CardFooter>
        ) : null}
      </Card>
      <CredentialModal open={open} onOpenChange={setOpen} tool={tool} />
    </>
  )
}
