interface Props {
  taxiFare: string
  airportName: string
  iata: string
}

function parseFare(fare: string): { amount: number; code: string } {
  const match = fare.match(/(\d+(?:\.\d+)?)\s*([A-Z]{3})?/)
  const amount = match ? parseFloat(match[1]) : 0
  const code = match?.[2] ?? 'EUR'
  return { amount, code }
}

function formatPrice(amount: number, code: string): string {
  const rounded = Math.round(amount * 100) / 100
  const str = rounded % 1 === 0 ? `${rounded}` : rounded.toFixed(2)
  return `${str} ${code}`
}

const BAR_COLORS = [
  'bg-orange-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-500',
]

const WIDTHS = ['w-full', 'w-1/2', 'w-1/3', 'w-1/4']

export default function CostPerPersonGraph({ taxiFare, airportName, iata }: Props) {
  const { amount, code } = parseFare(taxiFare)
  if (!amount) return null

  const rows = [1, 2, 3, 4].map((n) => ({
    passengers: n,
    price: amount / n,
  }))

  return (
    <div className="bg-white rounded-lg border border-slate-100 p-5 mb-8 shadow-sm">
      <h3 className="font-bold tracking-tight text-slate-900 text-base mb-1 leading-snug">
        Taking a taxi from {airportName} to the city centre is more affordable than you might expect.
      </h3>
      <p className="text-slate-400 text-xs mb-5">
        Cost per person based on a shared taxi fare of {taxiFare}
      </p>

      <div className="space-y-3">
        {rows.map(({ passengers, price }, i) => (
          <div key={passengers} className="flex items-center gap-3">
            <span className="text-slate-600 text-sm w-20 shrink-0">
              {passengers}&nbsp;{passengers === 1 ? 'person' : 'persons'}
            </span>
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="flex-1 bg-slate-100 rounded-full h-5 min-w-0">
                <div className={`${BAR_COLORS[i]} ${WIDTHS[i]} h-full rounded-full`} />
              </div>
              <span className="text-slate-900 text-sm font-bold shrink-0 w-28 text-right whitespace-nowrap">
                {formatPrice(price, code)}<span className="text-slate-400 font-normal text-xs"> p.p.</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <a
        href={`https://www.book-online-transfers.com/en/airmundo-airport-taxi?from_iata_code=${iata}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 w-full block bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-900 font-semibold text-sm px-4 py-2.5 rounded-md transition text-center"
      >
        Book a taxi →
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
