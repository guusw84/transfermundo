'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface AirportItem {
  slug: string
  name: string
  iata: string
  country: string
  googleScore: number
  destinations: string[]
}

export default function AirportCardGrid({ airports }: { airports: AirportItem[] }) {
  const searchParams = useSearchParams()
  const partner = searchParams.get('partner')

  function href(slug: string) {
    return partner ? `/${slug}?partner=${partner}` : `/${slug}`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {airports.map((airport) => (
        <Link
          key={airport.slug}
          href={href(airport.slug)}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="bg-blue-100 text-blue-700 text-sm font-bold px-2.5 py-1 rounded-lg">
              {airport.iata}
            </span>
            <span className="text-slate-400 text-xs">{airport.country}</span>
          </div>
          <h3 className="font-semibold text-slate-800 text-base group-hover:text-blue-700 transition-colors leading-snug">
            {airport.name}
          </h3>
          <p className="text-slate-500 text-xs mt-2">
            {airport.destinations.length === 1 ? 'Destination' : 'Destinations'}:{' '}
            {airport.destinations.join(', ')}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-yellow-500 text-sm">
              {'★'.repeat(Math.round(airport.googleScore))}
              {'☆'.repeat(5 - Math.round(airport.googleScore))}
              <span className="text-slate-500 text-xs ml-1">{airport.googleScore.toFixed(1)}</span>
            </span>
            <span className="text-blue-600 text-xs font-medium group-hover:underline">
              View guide →
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
