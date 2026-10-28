import { Suspense } from 'react'

export default function ViewLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>
}
