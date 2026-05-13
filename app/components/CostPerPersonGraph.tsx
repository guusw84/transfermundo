interface Props {
  taxiFare: string   // e.g. "66 EUR" or "50 CHF"
  airportName: string
  iata: string
}

const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
  CHF: 'CHF ',
}

function parseFare(fare: string): { amount: number; symbol: string } {
  const match = fare.match(/(\d+(?:\.\d+)?)\s*([A-Z]{3})?/)
  const amount = match ? parseFloat(match[1]) : 0
  const code = match?.[2] ?? 'EUR'
  return { amount, symbol: CURRENCY_SYMBOL[code] ?? `${code} ` }
}

function formatPrice(amount: number, symbol: string): string {
  const rounded = Math.round(amount * 100) / 100
  const str = rounded % 1 === 0 ? `${rounded}` : rounded.toFixed(2)
  return `${symbol}${str}`
}

const BAR_COLORS = [
  'bg-orange-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-500',
]

const WIDTHS = ['w-full', 'w-1/2', 'w-1/3', 'w-1/4']

export default function CostPerPersonGraph({ taxiFare, airportName, iata }: Props) {
  const { amount, symbol } = parseFare(taxiFare)
  if (!amount) return null

  const rows = [1, 2, 3, 4].map((n) => ({
    passengers: n,
    price: amount / n,
  }))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8">
      <h3 className="font-bold text-slate-800 text-base mb-1 leading-snug">
        Taking a taxi from {airportName} to the city centre is more affordable than you might expect.
      </h3>
      <p className="text-slate-500 text-xs mb-5">Cost per person based on a shared taxi fare of {taxiFare}</p>

      <div className="space-y-3">
        {rows.map(({ passengers, price }, i) => (
          <div key={passengers} className="flex items-center gap-3">
            <span className="text-slate-600 text-sm w-24 shrink-0">
              {passengers} {passengers === 1 ? 'passenger' : 'passengers'}
            </span>
            <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
              <div
                className={`${BAR_COLORS[i]} ${WIDTHS[i]} h-full rounded-full flex items-center px-3`}
              >
                <span className="text-white text-xs font-bold drop-shadow-sm">
                  {formatPrice(price, symbol)} p.p.
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <a
        href={`https://www.book-online-transfers.com/en/airmundo-airport-taxi?from_iata_code=${iata}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 w-full block bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-yellow-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition text-center"
      >
        Book taxi →
      </a>

      <p className="mt-3 text-slate-400 text-xs text-center">
        More than four passengers?{' '}
        <span className="text-slate-500">
          Book a minivan (up to 8 passengers) or minibus (up to 15 passengers) and pay even less per person!
        </span>
      </p>
    </div>
  )
}
