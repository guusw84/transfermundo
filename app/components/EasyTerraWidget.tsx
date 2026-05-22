'use client'

import { useEffect, useRef, useState } from 'react'

const BASE_PARAMS =
  'aff=15106&worry_free_filter=1&show_title=0&show_logo=0&new_window=1&mode=light&utm_source=TransferMundo&utm_content=Carrental'

export default function EasyTerraWidget({ iata }: { iata: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = `https://www.easyterra.com/widget.js?${BASE_PARAMS}&pickup_query=${iata}`
    script.async = true
    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [iata, mounted])

  if (!mounted) return null

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden my-6 p-4 [&_iframe]:w-full [&_iframe]:max-w-full [&_div]:max-w-full">
      <div ref={containerRef} />
    </div>
  )
}
