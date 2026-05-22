'use client'

import { useEffect } from 'react'

const BASE_PARAMS =
  'aff=15106&worry_free_filter=1&show_title=0&show_logo=0&new_window=1&mode=light&utm_source=TransferMundo&utm_content=Carrental'

export default function EasyTerraWidget({ iata }: { iata: string }) {
  const containerId = `easyterra-widget-${iata}`

  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById(containerId)
      if (!container) return

      container.innerHTML = ''

      const script = document.createElement('script')
      script.src = `https://www.easyterra.com/widget.js?${BASE_PARAMS}&pickup_query=${iata}`
      script.async = true
      container.appendChild(script)
    }, 50)

    return () => {
      clearTimeout(timer)
      const container = document.getElementById(containerId)
      if (container) container.innerHTML = ''
    }
  }, [iata, containerId])

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6 p-4 [&_iframe]:w-full [&_iframe]:max-w-full [&_div]:max-w-full">
      <div id={containerId} />
    </div>
  )
}
