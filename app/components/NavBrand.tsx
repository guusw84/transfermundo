'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { PARTNERS } from '@/lib/partners'

function TransferMundoText() {
  return (
    <span className="text-xl font-bold tracking-tight">
      Transfer<span className="text-blue-300">Mundo</span>
    </span>
  )
}

export default function NavBrand() {
  const params = useSearchParams()
  const partner = params.get('partner')
  const config = partner ? PARTNERS[partner.toLowerCase()] : null
  const href = partner ? `/?partner=${partner}` : '/'
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <Link href={href} className="hover:opacity-90 transition flex items-center">
      {config ? (
        <div className="flex items-center gap-2">
          {!imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.logoSrc}
              alt={config.name}
              className="h-7 w-auto object-contain"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="text-white font-bold text-sm">{config.name}</span>
          )}
          <span className="text-slate-400 text-xs md:text-sm font-medium">in partnership with</span>
          <TransferMundoText />
        </div>
      ) : (
        <TransferMundoText />
      )}
    </Link>
  )
}
