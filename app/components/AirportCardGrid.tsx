'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

interface AirportItem {
  slug: string
  name: string
  iata: string
  country: string
  destinations: string[]
}

const FLAGS: Record<string, string> = {
  'Netherlands': '🇳🇱',
  'Germany': '🇩🇪',
  'Spain': '🇪🇸',
  'France': '🇫🇷',
  'Italy': '🇮🇹',
  'Switzerland': '🇨🇭',
  'United Kingdom': '🇬🇧',
  'Belgium': '🇧🇪',
  'Austria': '🇦🇹',
  'Portugal': '🇵🇹',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Poland': '🇵🇱',
  'Czech Republic': '🇨🇿',
  'Hungary': '🇭🇺',
  'Greece': '🇬🇷',
  'Turkey': '🇹🇷',
  'United States': '🇺🇸',
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
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-md tracking-wide">
              {airport.iata}
            </span>
            <span className="text-slate-400 text-xs">{FLAGS[airport.country] ? `${FLAGS[airport.country]} ${airport.country}` : airport.country}</span>
          </div>
          <h3 className="font-semibold tracking-tight text-slate-900 text-base group-hover:text-indigo-700 transition-colors leading-snug mt-2">
            {airport.name}
          </h3>
          <p className="text-slate-500 text-xs mt-2">
            {airport.destinations.length === 1 ? 'Destination' : 'Destinations'}:{' '}
            {airport.destinations.join(', ')}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center text-slate-500 text-xs">
              <CheckCircle2 size={14} className="text-emerald-600 stroke-[1.5] mr-1 inline-block" />
              Verified connections
            </span>
            <span className="text-indigo-600 text-xs font-medium group-hover:underline">
              View guide →
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
