import { CarTaxiFront, Users } from 'lucide-react'
import { taxiUrl } from '@/lib/attribution'

interface Props {
  iata: string
  cityCenter: string
  time: string
  fare: string
  destName: string
}

export default function TaxiCard({ iata, cityCenter, time, fare, destName }: Props) {
  return (
    <div className="bg-white rounded-lg border border-slate-100 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-md">
              <CarTaxiFront size={18} className="text-slate-500 stroke-[1.5]" />
              Taxi · Door to door
            </span>
          </div>
          <p className="font-bold tracking-tight text-slate-900 text-base">
            Travel time to {cityCenter} (city centre) is {time}.
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Fare: <strong className="text-slate-700">{fare}</strong> (3–4 persons max)
          </p>
        </div>
        <a
          href={taxiUrl(iata)}
          target="_blank"
          rel="noopener"
          referrerPolicy="strict-origin-when-cross-origin"
          className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-amber-900 font-semibold text-sm px-5 py-2.5 rounded-md transition shrink-0"
        >
          {destName ? `Book a taxi to ${destName}` : 'Book a taxi'} →
        </a>
      </div>
      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-md px-4 py-3 flex gap-2.5">
        <Users className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-slate-600 text-sm leading-relaxed">
          <strong className="text-slate-700">Group Travel Tip:</strong> Standard taxis (sedan) comfortably
          accommodate up to 4 passengers. Splitting the cost between 3 or 4 passengers makes a taxi
          surprisingly affordable, offering the added luxury of a direct, time-saving trip from the airport
          to your accommodation.
        </p>
      </div>
    </div>
  )
}
