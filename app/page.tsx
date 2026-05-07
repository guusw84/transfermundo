import type { Metadata } from 'next'
import Link from 'next/link'
import AirportSearch from '@/app/components/AirportSearch'
import airportsData from '@/data/airports.json'

export const metadata: Metadata = {
  title: 'TransferMundo – Airport Transport Guides',
  description:
    'Find the fastest and cheapest way from airport to city centre. Train, bus, metro, taxi and rental car options for major European airports.',
}

interface Airport {
  slug: string
  name: string
  iata: string
  country: string
  googleScore: number
  destinations: { name: string }[]
}

const airports = airportsData as Airport[]

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            Transfer<span className="text-blue-300">Mundo</span>
          </span>
          <span className="text-blue-200 text-sm hidden sm:block">Get ready now!</span>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative text-white flex flex-col items-center justify-center px-4 py-20 md:py-28 text-center"
        style={{ backgroundImage: "url('/hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Dark overlay so text remains readable */}
        <div className="absolute inset-0 bg-blue-900/70" aria-hidden="true" />
        <p className="relative z-10 text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
          Your airport arrival guide
        </p>
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl mb-3">
          From the airport to the city - we'll guide you!
        </h1>
        <p className="relative z-10 text-blue-200 text-lg max-w-xl mb-10">
          How to reach the city centre? Everything you need to know about public transport, bus services,
          taxi, car rental and more at your destination airport. Explore the options and book!
        </p>

        <p className="relative z-10 text-blue-300 text-xs mb-4">
          Currently covering {airports.length} airports in Europe
        </p>

        {/* Search — extra bottom padding gives the absolute dropdown room to hang below the section */}
        <div className="relative z-10 w-full flex justify-center overflow-visible pb-20">
          <AirportSearch />
        </div>
      </section>

      {/* Airport cards */}
      <main className="max-w-5xl mx-auto w-full px-4 py-12">
        <h2 className="text-xl font-bold text-slate-700 mb-6">Browse all airports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {airports.map((airport) => (
            <Link
              key={airport.slug}
              href={`/${airport.slug}`}
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
                Destinations: {airport.destinations.map((d) => d.name).join(', ')}
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
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-800 text-slate-400 text-center py-8 text-sm">
        <p className="font-semibold text-white mb-1">TransferMundo</p>
        <p>© {new Date().getFullYear()} · Get ready now!</p>
      </footer>
    </div>
  )
}
