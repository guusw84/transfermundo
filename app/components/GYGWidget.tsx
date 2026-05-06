'use client'

import { useEffect, useRef } from 'react'

const PARTNER_ID = 'UMC8YRL'

export default function GYGWidget({ city }: { city: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear any previous widget instance before (re-)initialising
    container.innerHTML = ''

    const widget = document.createElement('div')
    widget.setAttribute('data-gyg-href', 'https://widget.getyourguide.com/default/activities.frame')
    widget.setAttribute('data-gyg-locale-code', 'en-US')
    widget.setAttribute('data-gyg-widget', 'activities')
    widget.setAttribute('data-gyg-number-of-items', '3')
    widget.setAttribute('data-gyg-partner-id', PARTNER_ID)
    widget.setAttribute('data-gyg-q', city)
    container.appendChild(widget)

    // If the GYG script has already loaded and exposed an init fn, call it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gyg = (window as any).GYG
    if (gyg?.Activities?.init) {
      gyg.Activities.init()
    }
  }, [city])

  return (
    <section className="max-w-5xl mx-auto px-4 pb-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Things to do in {city}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Make the most of your trip — explore top-rated activities and experiences.
      </p>
      <div ref={containerRef} />
    </section>
  )
}
