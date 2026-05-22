'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

export default function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  const params = useSearchParams()
  const partner = params.get('partner')
  return (
    <Link href={partner ? `/?partner=${partner}` : '/'} className={className}>
      {children}
    </Link>
  )
}
