'use client'

import { useSearchParams } from 'next/navigation'
import AirportSearch from './AirportSearch'
import { PARTNERS } from '@/lib/partners'

interface AirportItem {
  slug: string
  name: string
  iata: string
  country: string
}

const DEFAULT_HERO = '/hero.jpg'

export default function PartnerHero({
  airportCount,
  airports,
}: {
  airportCount: number
  airports: AirportItem[]
}) {
  const params = useSearchParams()
  const partner = params.get('partner')
  const config = partner ? PARTNERS[partner.toLowerCase()] : null
  const bgImage = config?.heroBg ?? DEFAULT_HERO

  return (
    <section
      className="relative text-white flex flex-col items-center justify-center px-4 py-20 md:py-28 text-center"
      style={{ backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-blue-900/70" aria-hidden="true" />
      <p className="relative z-10 text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
        Your airport arrival guide
      </p>
      <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl mb-3">
        From the airport to the city - we&apos;ll guide you!
      </h1>
      <p className="relative z-10 text-blue-200 text-lg max-w-xl mb-10">
        How to reach the city centre? Everything you need to know about public transport, bus services,
        taxi, car rental and more at your destination airport. Explore the options and book!
      </p>
      <p className="relative z-10 text-blue-300 text-xs mb-4">
        Currently covering {airportCount} airports in Europe
      </p>
      <div className="relative z-10 w-full flex justify-center overflow-visible pb-20">
        <AirportSearch airports={airports} />
      </div>
    </section>
  )
}
