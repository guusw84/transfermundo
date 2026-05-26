'use client'

import { useSearchParams } from 'next/navigation'

export default function PartnerBanner() {
  const params = useSearchParams()
  const partner = params.get('partner')
  if (!partner) return null

  return (
    <div className="bg-indigo-950 text-indigo-300 text-xs text-center py-2 px-4 border-b border-indigo-900">
      White Label Preview · Partner Mode Active —{' '}
      <strong className="text-white uppercase">{partner}</strong>
    </div>
  )
}
