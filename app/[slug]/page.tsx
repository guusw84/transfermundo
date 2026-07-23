import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Zap, Banknote, MapPin, CarTaxiFront, BadgeCheck } from 'lucide-react'
import { getAirports } from '@/lib/airports'
import type { Destination } from '@/lib/airports'
import GYGWidget from '@/app/components/GYGWidget'
import CostPerPersonGraph from '@/app/components/CostPerPersonGraph'
import EasyTerraWidget from '@/app/components/EasyTerraWidget'
import NavBrand from '@/app/components/NavBrand'
import LoungePairBanner from '@/app/components/LoungePairBanner'
import RentalCarCard from '@/app/components/RentalCarCard'
import TaxiCard from '@/app/components/TaxiCard'
import TransportOptionCard from '@/app/components/TransportOptionCard'
import { taxiUrl } from '@/lib/attribution'
import { airportPageMeta } from '@/lib/seo'

const airports = getAirports()

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return airports.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const airport = airports.find((a) => a.slug === slug)
  if (!airport) return {}
  return airportPageMeta(airport)
}


function hasCheapest(dest: Destination): boolean {
  const m = dest.cheapest.mode
  return Boolean(m) && m !== 'null' && m !== '0'
}

function lastUpdatedLabel(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() - 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export default async function AirportPage({ params }: Props) {
  const { slug } = await params
  const airport = airports.find((a) => a.slug === slug)
  if (!airport) notFound()

  return (
    <div className="min-h-screen bg-slate-50 font-sans" suppressHydrationWarning>

      {/* Navbar */}
      <nav className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Suspense fallback={<span className="text-xl font-bold tracking-tight">Transfer<span className="text-blue-400">Mundo</span></span>}>
            <NavBrand />
          </Suspense>
          <span className="text-slate-400 text-sm hidden sm:block">Choose your airport transfer!</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-[#0f172a] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">
            {airport.continent} · {airport.country}
          </p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{airport.name}</h1>
              <p className="text-slate-400 mt-1 text-sm">
                IATA: <strong className="text-white">{airport.iata}</strong> &nbsp;·&nbsp;
                ICAO: <strong className="text-white">{airport.icao}</strong>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-md px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 text-xs font-medium">
                  {airport.destinations.length === 1 ? 'Popular nearby destination' : 'Popular nearby destinations'}:
                </span>
                <span className="text-white font-semibold text-sm">
                  {airport.destinations.map((d) => d.name).join(', ')}
                </span>
              </div>
            </div>
            <div className="hidden md:block shrink-0 text-right" suppressHydrationWarning>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                <BadgeCheck className="w-3.5 h-3.5 text-slate-300" />
                Verified Data
              </span>
              <p className="text-slate-400 text-xs mt-1" suppressHydrationWarning>Last updated: {lastUpdatedLabel()}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              { label: 'Location', value: airport.location },
              {
                label: 'To city centre',
                value: (() => {
                  const d = airport.destinations[0]
                  if (!d) return 'N/A'
                  const km = d.distanceKm || null
                  const mi = d.distanceMiles || null
                  const time = d.taxi.time || null
                  if (!km && !mi && !time) return 'N/A'
                  const dist = km && mi ? `${km} km / ${mi.toFixed(1)} m` : km ? `${km} km` : mi ? `${mi.toFixed(1)} m` : null
                  const parts = [dist, time ?? null].filter(Boolean)
                  return parts.join(' - ')
                })(),
              },
              { label: 'Terminals', value: airport.terminals },
              { label: 'Passengers', value: airport.passengers2023 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-md">
                <span className="text-slate-400 text-xs block mb-0.5">{label}</span>
                <span className="font-semibold text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Car rental popular banner */}
      {airport.carRental.popular && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-4 text-sm text-amber-900">
            <strong>Planning to rent a car?</strong> Book early to avoid limited availability and
            higher last-minute prices during peak season at {airport.name}. Compare prices and book
            your car today!
          </div>
        </div>
      )}

      {/* Destination selector — only shown when multiple destinations exist */}
      {airport.destinations.length > 1 && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Where are you going?</p>
            <div className="flex flex-wrap gap-2">
              {airport.destinations.map((dest, di) => (
                <a
                  key={di}
                  href={`#destination-${di + 1}`}
                  className="text-sm font-medium px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {dest.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-14">
        {airport.destinations.map((dest, di) => (
          <section key={di} id={`destination-${di + 1}`} aria-labelledby={`dest-heading-${di}`} className="scroll-mt-24">

            {/* Destination header */}
            <div className="mb-6">
              <h2
                id={`dest-heading-${di}`}
                className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900"
              >
                {airport.name} → {dest.name}
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                City centre: <strong className="text-slate-700">{dest.cityCenter}</strong>
                &nbsp;·&nbsp;{`${dest.distanceKm} km / ${dest.distanceMiles.toFixed(1)} miles`}
                &nbsp;·&nbsp;{dest.transportOptionsCount === 1 ? '1 available transport option right now (incl. taxi)' : `${dest.transportOptionsCount} available transport options right now (incl. taxi)`}
              </p>
            </div>

            {/* 1. Taxi cost-per-person graph */}
            <CostPerPersonGraph
              taxiFare={dest.taxi.fare}
              airportName={airport.name}
              iata={airport.iata}
            />

            {/* 2. Travel expenses title + comparison cards */}
            <h3 className="font-semibold tracking-tight text-slate-700 text-sm uppercase tracking-wide mb-3">
              Travel expenses to/from {dest.name}
            </h3>
            <div className={`grid grid-cols-1 gap-4 mb-6 ${hasCheapest(dest) ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>

              {/* Fastest */}
              <div className="bg-white rounded-lg border border-slate-100 p-5 flex flex-col gap-2 shadow-sm">
                <span className="inline-flex items-center gap-1.5 bg-slate-800 text-white text-xs font-semibold px-2.5 py-1 rounded-md w-fit">
                  <Zap className="w-3.5 h-3.5" />
                  Fastest
                </span>
                <p className="text-slate-900 font-bold tracking-tight text-lg leading-snug">{dest.fastest.mode}</p>
                <p className="text-slate-500 text-sm">{dest.fastest.time}</p>
                <p className="text-indigo-700 font-semibold text-base">{dest.fastest.price}</p>
                <a
                  href={dest.fastest.link}
                  target="_blank"
                  rel="noopener"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className={`mt-auto font-semibold text-sm px-4 py-2 rounded-md transition text-center ${
                    dest.fastest.mode === 'Taxi'
                      ? 'bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-900'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
                  }`}
                >
                  {dest.fastest.mode === 'Taxi' ? (dest.name ? `Book a taxi to ${dest.name} →` : 'Book a taxi →') : 'Buy tickets →'}
                </a>
              </div>

              {/* Cheapest */}
              {hasCheapest(dest) && (
                <div className="bg-white rounded-lg border border-slate-100 p-5 flex flex-col gap-2 shadow-sm">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-md w-fit">
                    <Banknote className="w-3.5 h-3.5" />
                    Cheapest
                  </span>
                  <p className="text-slate-900 font-bold tracking-tight text-lg leading-snug">{dest.cheapest.mode}</p>
                  <p className="text-slate-500 text-sm">{dest.cheapest.time}</p>
                  <p className="text-emerald-800 font-semibold text-base">{dest.cheapest.price}</p>
                  <a
                    href={dest.cheapest.link}
                    target="_blank"
                    rel="noopener"
                  referrerPolicy="strict-origin-when-cross-origin"
                    className="mt-auto bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-sm px-4 py-2 rounded-md transition text-center"
                  >
                    Buy tickets →
                  </a>
                </div>
              )}

              {/* Door to door */}
              <div className="bg-white rounded-lg border border-slate-100 p-5 flex flex-col gap-2 shadow-sm">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-md w-fit">
                  <CarTaxiFront size={18} className="text-slate-500 stroke-[1.5]" />
                  Door to door
                </span>
                <p className="text-slate-900 font-bold tracking-tight text-lg leading-snug">Taxi · Convenience and Time Saving</p>
                <p className="text-slate-500 text-sm">{dest.taxi.time}</p>
                <p className="text-amber-700 font-semibold text-base">{dest.taxi.fare}</p>
                <a
                  href={taxiUrl(airport.iata)}
                  target="_blank"
                  rel="noopener"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="mt-auto bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-900 font-semibold text-sm px-4 py-2 rounded-md transition text-center"
                >
                  {dest.name ? `Book a taxi to ${dest.name}` : 'Book a taxi'} →
                </a>
              </div>
            </div>

            {/* 3. Rental car block */}
            <div className="mb-4">
              <RentalCarCard carRental={airport.carRental} />
            </div>

            {/* Car rental widget — first destination only */}
            {di === 0 && (
              <>
                <h3 className="text-lg font-bold tracking-tight text-slate-700 mb-4">
                  Compare local rates and secure your rental car
                </h3>
                <EasyTerraWidget iata={airport.iata} />
              </>
            )}

            {/* Transport option cards */}
            {dest.transportOptions.length > 0 && (
              <h3 className="text-lg font-semibold tracking-tight text-slate-700 mb-4">All transport options to {dest.name}</h3>
            )}
            <div className="space-y-4">

              {/* Taxi card */}
              <TaxiCard
                iata={airport.iata}
                cityCenter={dest.cityCenter}
                time={dest.taxi.time}
                fare={dest.taxi.fare}
                destName={dest.name}
              />

              {/* Public transport cards */}
              {dest.transportOptions.length > 0 && dest.transportOptions.map((opt, oi) => (
                <TransportOptionCard key={oi} opt={opt} />
              ))}

              {/* Car rental card */}
              <RentalCarCard carRental={airport.carRental} />
            </div>
          </section>
        ))}

        {/* General information */}
        <section aria-labelledby="general-info-heading">
          <h2
            id="general-info-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 mb-5"
          >
            General information
          </h2>
          <div className="bg-white rounded-lg border border-slate-100 p-6 space-y-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <InfoItem label="IATA / ICAO" value={`${airport.iata} / ${airport.icao}`} />
              <InfoItem label="Country" value={airport.country} />
              <InfoItem label="Address" value={airport.address} />
              <InfoItem label="Location" value={airport.location} />
              {airport.alsoKnownAs && (
                <InfoItem label="Also known as" value={airport.alsoKnownAs} />
              )}
              <InfoItem label="Terminals" value={airport.terminals} />
              <InfoItem label="Passengers (2023)" value={airport.passengers2023} />
              {airport.operator && (
                <InfoItem label="Airport operator" value={airport.operator} />
              )}
              <InfoItem
                label="Google score"
                value={`${airport.googleScore.toFixed(1)} / 5 (${airport.googleReviews} reviews)`}
              />
              <InfoItem label="Last update" value={airport.lastUpdate} />
            </div>

            {airport.goodToKnow && (
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Good to know</p>
                <p className="text-slate-700 text-sm leading-relaxed">{airport.goodToKnow}</p>
              </div>
            )}

            {airport.moneySavingTip && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-md p-4">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Money-saving tip</p>
                <p className="text-slate-700 text-sm leading-relaxed">{airport.moneySavingTip}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {airport.destinations[0]?.gygQuery && (
        <GYGWidget city={airport.destinations[0].gygQuery} />
      )}

      <LoungePairBanner iata={airport.iata} />

      <footer className="bg-slate-900 text-slate-400 text-center py-8 mt-6 text-sm border-t border-slate-800">
        <p className="font-semibold text-white mb-1">TransferMundo</p>
        <p suppressHydrationWarning>© {new Date().getFullYear()} · Choose your airport transfer!</p>
      </footer>
    </div>
  )
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-slate-400 text-xs uppercase tracking-wide block mb-0.5">{label}</span>
      <span className={`${highlight ? 'font-semibold text-slate-900' : 'text-slate-700'} text-sm`}>
        {value}
      </span>
    </div>
  )
}
