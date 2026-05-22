'use client'

import { useSearchParams } from 'next/navigation'

export default function PartnerBanner() {
  const params = useSearchParams()
  const partner = params.get('partner')
  if (!partner) return null

  return (
    <div className="bg-slate-900 text-white text-xs text-center py-2 px-4">
      ⚙️ White Label Preview: Partner Mode Active —{' '}
      <strong className="uppercase">{partner}</strong>
    </div>
  )
}
