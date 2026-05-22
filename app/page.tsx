import type { Metadata } from 'next'
import { Suspense } from 'react'
import AirportSearch from '@/app/components/AirportSearch'
import AirportCardGrid from '@/app/components/AirportCardGrid'
import { getAirports } from '@/lib/airports'

export const metadata: Metadata = {
  title: 'TransferMundo – Airport Transport Guides',
  description:
    'Find the fastest and cheapest way from airport to city centre. Train, bus, metro, taxi and rental car options for major European airports.',
}

export default function HomePage() {
  const airports = getAirports()
  const cardData = airports.map((a) => ({
    slug: a.slug,
    name: a.name,
    iata: a.iata,
    country: a.country,
    googleScore: a.googleScore,
    destinations: a.destinations.map((d) => d.name),
  }))

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
          From the airport to the city - we&apos;ll guide you!
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
          <Suspense fallback={null}>
            <AirportSearch airports={airports.map((a) => ({ slug: a.slug, name: a.name, iata: a.iata, country: a.country }))} />
          </Suspense>
        </div>
      </section>

      {/* Airport cards */}
      <main className="max-w-5xl mx-auto w-full px-4 py-12">
        <h2 className="text-xl font-bold text-slate-700 mb-6">Browse all airports</h2>
        <Suspense fallback={null}>
          <AirportCardGrid airports={cardData} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-800 text-slate-400 text-center py-8 text-sm">
        <p className="font-semibold text-white mb-1">TransferMundo</p>
        <p suppressHydrationWarning>© {new Date().getFullYear()} · Get ready now!</p>
      </footer>
    </div>
  )
}
