import type { Metadata } from 'next'
import { Suspense } from 'react'
import AirportCardGrid from '@/app/components/AirportCardGrid'
import NavBrand from '@/app/components/NavBrand'
import PartnerHero from '@/app/components/PartnerHero'
import { getAirports } from '@/lib/airports'

export const metadata: Metadata = {
  title: 'TransferMundo – Airport Transport Guides',
  description:
    'Find the fastest and cheapest way from airport to city centre. Train, bus, metro, taxi and rental car options for major European airports.',
}

export default function HomePage() {
  const airports = getAirports()
  const searchAirports = airports.map((a) => ({ slug: a.slug, name: a.name, iata: a.iata, country: a.country }))
  const cardData = airports.map((a) => ({
    slug: a.slug,
    name: a.name,
    iata: a.iata,
    country: a.country,
    destinations: a.destinations.map((d) => d.name),
  }))

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Suspense fallback={<span className="text-xl font-bold tracking-tight">Transfer<span className="text-blue-400">Mundo</span></span>}>
            <NavBrand />
          </Suspense>
          <span className="text-slate-400 text-sm hidden sm:block">Choose your airport transfer!</span>
        </div>
      </nav>

      {/* Hero — client component handles partner-specific background swap */}
      <Suspense
        fallback={
          <section
            className="relative text-white flex flex-col items-center justify-center px-4 py-20 md:py-28 text-center"
            style={{ backgroundImage: "url('/hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-blue-900/70" aria-hidden="true" />
          </section>
        }
      >
        <PartnerHero airportCount={airports.length} airports={searchAirports} />
      </Suspense>

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
        <p suppressHydrationWarning>© {new Date().getFullYear()} · Choose your airport transfer!</p>
      </footer>
    </div>
  )
}
