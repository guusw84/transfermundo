import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAirports } from '@/lib/airports'
import type { Airport, Destination, TransportOption } from '@/lib/airports'
import GYGWidget from '@/app/components/GYGWidget'
import CostPerPersonGraph from '@/app/components/CostPerPersonGraph'

const airports = getAirports()

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return airports.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const airport = airports.find((a) => a.slug === slug)
  if (!airport) return {}
  return {
    title: `${airport.name} (${airport.iata}) Transport Guide – TransferMundo`,
    description: `How to get from ${airport.name} to the city centre. Compare fastest and cheapest transport options: train, bus, metro, taxi and rental car.`,
  }
}

function transportBadgeStyle(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('train')) return 'bg-blue-100 text-blue-800'
  if (t.includes('bus') && t.includes('metro')) return 'bg-indigo-100 text-indigo-800'
  if (t.includes('bus')) return 'bg-emerald-100 text-emerald-800'
  if (t.includes('metro') || t.includes('s-bahn') || t.includes('u-bahn')) return 'bg-purple-100 text-purple-800'
  return 'bg-slate-100 text-slate-700'
}

function transportIcon(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('train')) return '🚆'
  if (t.includes('bus') && t.includes('metro')) return '🚌🚇'
  if (t.includes('bus')) return '🚌'
  if (t.includes('metro') || t.includes('s-bahn') || t.includes('u-bahn')) return '🚇'
  return '🚌'
}

function hasCheapest(dest: Destination): boolean {
  const m = dest.cheapest.mode
  return Boolean(m) && m !== 'null' && m !== '0'
}

export default async function AirportPage({ params }: Props) {
  const { slug } = await params
  const airport = airports.find((a) => a.slug === slug)
  if (!airport) notFound()

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition">
            Transfer<span className="text-blue-300">Mundo</span>
          </Link>
          <span className="text-blue-200 text-sm hidden sm:block">Get ready now!</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <p className="text-blue-300 text-sm font-medium mb-1 uppercase tracking-wider">
            {airport.continent} · {airport.country}
          </p>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{airport.name}</h1>
            <p className="text-blue-300 mt-1 text-sm">
              IATA: <strong className="text-white">{airport.iata}</strong> &nbsp;·&nbsp;
              ICAO: <strong className="text-white">{airport.icao}</strong>
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
              <span className="text-blue-200 text-xs font-medium">
                📍 {airport.destinations.length === 1 ? 'Popular nearby destination' : 'Popular nearby destinations'}:
              </span>
              <span className="text-white font-bold text-sm">
                {airport.destinations.map((d) => d.name).join(', ')}
              </span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-blue-300 text-xs block mb-0.5">Location</span>
              <span className="font-semibold">{airport.location}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-blue-300 text-xs block mb-0.5">Number of terminals</span>
              <span className="font-semibold">{airport.terminals}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-blue-300 text-xs block mb-0.5">Passengers</span>
              <span className="font-semibold">{airport.passengers2023}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-blue-300 text-xs block mb-0.5">Reviews</span>
              <span className="font-semibold">{airport.googleScore.toFixed(1)} ★ / 5.0 · {airport.googleReviews}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Car rental popular banner */}
      {airport.carRental.popular && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-4 text-sm text-amber-900">
            <span className="font-semibold">Early booking highly recommended:</span> Do you want to{' '}
            <strong>rent a car</strong>, don&apos;t wait any longer. {airport.name} is one of{' '}
            {airport.continent}&apos;s busiest car rental hubs. By booking ahead, you avoid long
            queues and the steep price hikes of last-minute rentals. Compare prices and book your
            car today!
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-14">
        {airport.destinations.map((dest, di) => (
          <section key={di} aria-labelledby={`dest-heading-${di}`}>
            {/* Destination header */}
            <div className="mb-6">
              <h2
                id={`dest-heading-${di}`}
                className="text-2xl md:text-3xl font-bold text-slate-800"
              >
                {airport.name} → {dest.name}
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                City centre: <strong className="text-slate-700">{dest.cityCenter}</strong>
                &nbsp;·&nbsp;{dest.distanceKm} km / {dest.distanceMiles.toFixed(1)} miles
                &nbsp;·&nbsp;{dest.transportOptionsCount} transport options (incl. taxi)
              </p>
            </div>

            {/* Fastest / Cheapest / Door to door */}
            <div className={`grid grid-cols-1 gap-4 mb-8 ${hasCheapest(dest) ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit">
                  ⚡ Fastest
                </span>
                <p className="text-slate-800 font-bold text-lg leading-snug">{dest.fastest.mode}</p>
                <p className="text-slate-500 text-sm">{dest.fastest.time}</p>
                <p className="text-blue-700 font-semibold text-base">{dest.fastest.price}</p>
                <a
                  href={dest.fastest.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-4 py-2 rounded-xl transition text-center"
                >
                  {dest.fastest.mode === 'Taxi' ? 'Book taxi →' : 'Buy tickets →'}
                </a>
              </div>

              {hasCheapest(dest) && (
                <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit">
                    💰 Cheapest
                  </span>
                  <p className="text-slate-800 font-bold text-lg leading-snug">{dest.cheapest.mode}</p>
                  <p className="text-slate-500 text-sm">{dest.cheapest.time}</p>
                  <p className="text-green-700 font-semibold text-base">{dest.cheapest.price}</p>
                  <a
                    href={dest.cheapest.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-sm px-4 py-2 rounded-xl transition text-center"
                  >
                    Buy tickets →
                  </a>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-yellow-100 shadow-sm p-5 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full w-fit">
                  🚕 Door to door
                </span>
                <p className="text-slate-800 font-bold text-lg leading-snug">Taxi · Convenience and Time Saving</p>
                <p className="text-slate-500 text-sm">{dest.taxi.time}</p>
                <p className="text-yellow-700 font-semibold text-base">{dest.taxi.fare}</p>
                <a
                  href={`https://www.book-online-transfers.com/en/airmundo-airport-taxi?from_iata_code=${airport.iata}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-yellow-900 font-semibold text-sm px-4 py-2 rounded-xl transition text-center"
                >
                  Book taxi →
                </a>
              </div>
            </div>

            {/* Expenses overview table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                  Travel expenses to/from {dest.name}
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                <ExpenseRow label="Fastest" value={`${dest.fastest.mode} · ${dest.fastest.time} · ${dest.fastest.price}`} accent="blue" />
                <ExpenseRow label="Cheapest" value={hasCheapest(dest) ? `${dest.cheapest.mode} · ${dest.cheapest.time} · ${dest.cheapest.price}` : '...'} accent="green" />
                <ExpenseRow
                  label="Door to door"
                  sub="Taxi"
                  value={`${dest.taxi.time} · ${dest.taxi.fare} · 3–4 persons max`}
                  accent="yellow"
                />
                <ExpenseRow
                  label="Flexibility"
                  sub="Rental car"
                  value={`€${airport.carRental.eur} / £${airport.carRental.gbp} / $${airport.carRental.usd} per day · Go further!`}
                  accent="slate"
                />
              </div>
            </div>

            <CostPerPersonGraph
              taxiFare={dest.taxi.fare}
              airportName={airport.name}
              iata={airport.iata}
            />

            {/* Transport option cards */}
            {dest.transportOptions.length > 0 && (
              <h3 className="text-lg font-semibold text-slate-700 mb-4">All transport options to {dest.name}</h3>
            )}
            <div className="space-y-4">
              {/* Taxi card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        🚕 Taxi · Door to door
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-base">
                      Travel time to {dest.cityCenter}: {dest.taxi.time}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      Fare: <strong className="text-slate-700">{dest.taxi.fare}</strong> (3–4 persons max)
                    </p>
                  </div>
                  <a
                    href={`https://www.book-online-transfers.com/en/airmundo-airport-taxi?from_iata_code=${airport.iata}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-yellow-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition shrink-0"
                  >
                    Book taxi →
                  </a>
                </div>
                <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 flex gap-2.5">
                  <span className="text-yellow-500 text-base shrink-0 mt-0.5">👥</span>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    <strong className="text-slate-700">Group Travel Tip:</strong> Standard taxis (sedan) comfortably
                    accommodate up to 4 passengers. Splitting the cost between 3 or 4 passengers makes a taxi
                    surprisingly affordable, offering the added luxury of a direct, time-saving trip from the airport
                    to your accommodation.
                  </p>
                </div>
              </div>

              {/* Public transport cards */}
              {dest.transportOptions.length > 0 && dest.transportOptions.map((opt, oi) => (
                <div
                  key={oi}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`${transportBadgeStyle(opt.type)} text-xs font-semibold px-2.5 py-1 rounded-full`}
                        >
                          {transportIcon(opt.type)} {opt.type}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-xl leading-snug">{opt.serviceName}</p>
                      <p className="text-slate-500 text-sm mt-0.5">Operated by {opt.operator}</p>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <InfoItem label="Board at" value={opt.boardingLocation} />
                        <InfoItem label="Travel time" value={opt.travelTime} highlight />
                        <InfoItem label="Frequency" value={opt.frequency} />
                        <InfoItem label="Main stops" value={opt.mainStations} />
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 lg:min-w-[130px]">
                      <div className="text-left lg:text-right">
                        <p className="text-2xl font-extrabold text-slate-800">{opt.priceAdult}</p>
                        <p className="text-slate-400 text-xs">adults · one-way</p>
                        <p className="text-slate-600 text-sm mt-0.5">
                          {opt.priceChild} <span className="text-slate-400">children</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <a
                          href={opt.buyTicketsLink.startsWith('http') ? opt.buyTicketsLink : opt.timetableLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition text-center"
                        >
                          Buy tickets →
                        </a>
                        <a
                          href={opt.timetableLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition text-center"
                        >
                          Timetable →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Car rental card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        🚗 Rental car · Flexibility
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-base">
                      Car rental offices: {airport.carRental.location}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      From{' '}
                      <strong className="text-slate-700">
                        €{airport.carRental.eur} / £{airport.carRental.gbp} / ${airport.carRental.usd}
                      </strong>{' '}
                      per day
                    </p>
                  </div>
                  <button className="bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shrink-0">
                    Book rental car →
                  </button>
                </div>
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex gap-2.5">
                  <span className="text-slate-400 text-base shrink-0 mt-0.5">🚗</span>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    <strong className="text-slate-700">Car Hire Tip:</strong> Just like airline tickets, car rental
                    prices rise as availability drops. To secure the best rate and your preferred vehicle, don't wait
                    until you land. Book your rental car now to lock in today's lower prices.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* General information */}
        <section aria-labelledby="general-info-heading">
          <h2
            id="general-info-heading"
            className="text-2xl font-bold text-slate-800 mb-5"
          >
            General information
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
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
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">
                  Good to know
                </p>
                <p className="text-slate-700 text-sm leading-relaxed">{airport.goodToKnow}</p>
              </div>
            )}

            {airport.moneySavingTip && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                  Money-saving tip
                </p>
                <p className="text-slate-700 text-sm leading-relaxed">{airport.moneySavingTip}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* GetYourGuide activities widget — only shown when supply exists for the destination */}
      {airport.destinations[0]?.gygQuery && (
        <GYGWidget city={airport.destinations[0].gygQuery} />
      )}

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 text-center py-8 mt-6 text-sm">
        <p className="font-semibold text-white mb-1">TransferMundo</p>
        <p suppressHydrationWarning>© {new Date().getFullYear()} · Get ready now!</p>
      </footer>
    </div>
  )
}

function ExpenseRow({
  label,
  sub,
  value,
  accent,
}: {
  label: string
  sub?: string
  value: string
  accent: 'blue' | 'green' | 'yellow' | 'slate'
}) {
  const accentMap = {
    blue: 'text-blue-700 font-bold',
    green: 'text-green-700 font-bold',
    yellow: 'text-yellow-700 font-bold',
    slate: 'text-slate-700 font-bold',
  }
  return (
    <div className="px-5 py-3 flex items-start gap-3">
      <div className="w-28 shrink-0">
        <span className={`text-sm ${accentMap[accent]}`}>{label}</span>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
      <p className="text-slate-600 text-sm">{value}</p>
    </div>
  )
}

function InfoItem({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <span className="text-slate-400 text-xs uppercase tracking-wide block mb-0.5">{label}</span>
      <span className={`${highlight ? 'font-semibold text-slate-800' : 'text-slate-700'} text-sm`}>
        {value}
      </span>
    </div>
  )
}
