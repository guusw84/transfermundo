import type { Metadata } from 'next'
import { Train, Bus, CarTaxiFront, MapPin, ShieldCheck, RefreshCw } from 'lucide-react'
import { Suspense } from 'react'
import NavBrand from '@/app/components/NavBrand'
import Footer from '@/app/components/Footer'
import { aboutPageMeta } from '@/lib/seo'

export const metadata: Metadata = aboutPageMeta()

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

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
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">About Us</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Simplifying airport ground transport
          </h1>
          <p className="text-slate-300 mt-3 max-w-2xl leading-relaxed">
            TransferMundo curates verified transport data for European airports so travellers can make an informed choice — fast — without juggling multiple websites.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-14">

        {/* Mission */}
        <section aria-labelledby="mission-heading">
          <h2 id="mission-heading" className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
            Our mission
          </h2>
          <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 md:p-8">
            <p className="text-slate-700 leading-relaxed">
              Getting from the airport to the city should be straightforward. In practice, travellers face a maze of transit websites, inconsistent pricing pages, and unfamiliar route names — often under time pressure after a long flight.
            </p>
            <p className="text-slate-700 leading-relaxed mt-4">
              TransferMundo cuts through that noise. For every airport we cover, we research every realistic transport option, compare journey times and indicative prices, and present the information in a single, consistent format. Our goal is to help you choose the right option in under a minute.
            </p>
          </div>
        </section>

        {/* What data we offer */}
        <section aria-labelledby="data-heading">
          <h2 id="data-heading" className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
            What data we offer
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            For each airport and destination combination we publish the following structured information:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 flex gap-4">
              <span className="shrink-0 mt-0.5">
                <Train className="w-5 h-5 text-indigo-600" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Transport modes</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Trains, express rail services, metros, city buses, airport coaches, and door-to-door taxi transfers. Each option is described by type, operator, boarding location, key stops, and onward connections.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 flex gap-4">
              <span className="shrink-0 mt-0.5">
                <Bus className="w-5 h-5 text-emerald-600" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Journey times &amp; frequency</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Typical journey time to the city centre landmark and service frequency — whether that's every ten minutes or once an hour — so you can plan around your schedule.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 flex gap-4">
              <span className="shrink-0 mt-0.5">
                <CarTaxiFront className="w-5 h-5 text-amber-500" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Indicative pricing</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  One-way adult and child fares in the local currency. We surface the fastest option and the cheapest option side by side so the trade-off is immediately visible. All prices are indicative reference fares, not live-quoted rates.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 flex gap-4">
              <span className="shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-rose-500" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Booking &amp; timetable links</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Direct links to the official timetable page and, where available, the operator's ticket purchase flow — so you go straight to the source without an extra search.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-5 text-sm text-blue-900">
            <strong>Booking partner integrations:</strong> For select operators we integrate with booking partners such as Distribusion, enabling a seamless path from information to purchase. These integrations are disclosed on the relevant transport card. Taxi bookings are handled through our partner <em>Book Online Transfers</em>.
          </div>
        </section>

        {/* B2B API data breakdown */}
        <section aria-labelledby="api-heading">
          <h2 id="api-heading" className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            B2B API data
          </h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Our B2B API tailored for airlines, airports and OTAs provides the following ground transportation content for the top destination(s) near the airport:
          </p>

          <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Left column — transport data points */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Key data:</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {[
                    'Number of nearby destinations',
                    'Name nearby city & city centre',
                    'Distance to city centre in km / miles',
                    'Number of transportation options *',
                    'Location station/stop at airport',
                    'Service name',
                    'Operator',
                    'Main stations',
                    'Timetable link',
                    'Buy tickets link',
                    'Travel time',
                    'Frequency',
                    'One-way adults fare',
                    'One-way children fare',
                    'Fastest & Cheapest',
                    'Taxi — travel time to city centre',
                    'Taxi fare',
                    'Taxi stand location(s)',
                    'Car rental — location of car rental companies',
                    'Car rental — price per day in EUR / GBP / USD',
                    'Car rental popular — yes or no',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-slate-400 leading-relaxed">
                  * Number of transportation options to nearby city (maximum&nbsp;3) can be 1&nbsp;(only taxi) to maximum 4&nbsp;(taxi&nbsp;+&nbsp;3 transportation options)
                </p>
              </div>

              {/* Right column — extras */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Extras:</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {[
                    'IATA airport code',
                    'ICAO airport code',
                    'Country',
                    'Continent',
                    'Address',
                    'Location relative to the nearest city',
                    'Also known as',
                    'Number of terminals',
                    'Number of passengers',
                    'Airport operator',
                    'Good to know',
                    'Money-saving tip',
                    'App public transport tickets',
                    'Google airport score',
                    'Number of reviews',
                    'Last update',
                    'Customer requests',
                  ].map((item, i, arr) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${i === arr.length - 1 ? 'bg-slate-300' : 'bg-emerald-400'}`} />
                      <span className={i === arr.length - 1 ? 'text-slate-400 italic' : ''}>
                        {i === arr.length - 1 ? `(${item})` : item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Data verification & quality */}
        <section aria-labelledby="quality-heading">
          <h2 id="quality-heading" className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
            Data verification &amp; quality
          </h2>

          <div className="bg-white rounded-lg border border-slate-100 shadow-sm divide-y divide-slate-100">

            <div className="p-6 flex gap-4">
              <span className="shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Manually curated and standardised</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Every transport record is researched directly from official operator sources — transit authority websites, rail operator timetable pages, and airport information portals. We do not scrape or infer data. Each airport goes through a structured review that normalises terminology, boarding locations, and route descriptions into a consistent format across all destinations.
                </p>
              </div>
            </div>

            <div className="p-6 flex gap-4">
              <span className="shrink-0 mt-0.5">
                <RefreshCw className="w-5 h-5 text-indigo-600" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Periodic review cycle</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Airport transport networks change: operators are replaced, fares are revised, and new routes are introduced. We review each airport record periodically and publish a last-updated date so you know how recent the information is. If you spot an inaccuracy, please reach out — we take data quality seriously.
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-sm text-amber-900">
                <strong>Important:</strong> All prices published on TransferMundo are indicative reference fares based on publicly available information at the time of our last review. They are not live-quoted and may not reflect current pricing. Always verify the fare on the operator's website before travelling.
              </div>
            </div>

          </div>
        </section>

        {/* Airport coverage */}
        <section aria-labelledby="coverage-heading">
          <h2 id="coverage-heading" className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
            Airport coverage
          </h2>
          <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6">
            <p className="text-slate-700 text-sm leading-relaxed">
              We currently cover ten major European airports — Amsterdam (AMS), Berlin (BER), Basel / Mulhouse / Freiburg (BSL), Budapest (BUD), Paris Charles de Gaulle (CDG), Dublin (DUB), Rome Fiumicino (FCO), Helsinki (HEL), Madrid Barajas (MAD), and London Stansted (STN) — with more airports planned.
            </p>
            <a
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Browse all airports →
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
