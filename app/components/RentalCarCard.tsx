import { CarFront, MessageCircleMore } from 'lucide-react'
import { rentalCarUrl } from '@/lib/attribution'

interface Props {
  carRental: {
    location: string
    eur: number
    gbp: number
    usd: number
  }
}

export default function RentalCarCard({ carRental }: Props) {
  return (
    <div className="bg-white rounded-lg border border-slate-100 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
              <CarFront size={18} className="text-slate-500 stroke-[1.5]" />
              Rental car · Flexibility
            </span>
          </div>
          <p className="font-bold tracking-tight text-slate-900 text-base">
            Car rental offices: {carRental.location}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            From{' '}
            <strong className="text-slate-700">
              €{carRental.eur} / £{carRental.gbp} / ${carRental.usd}
            </strong>{' '}
            per day
          </p>
        </div>
        <a
          href={rentalCarUrl()}
          target="_blank"
          rel="noopener"
          referrerPolicy="strict-origin-when-cross-origin"
          className="bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-semibold text-sm px-5 py-2.5 rounded-md transition shrink-0"
        >
          Book rental car →
        </a>
      </div>
      <div className="mt-4 bg-slate-50 border border-slate-100 rounded-md px-4 py-3 flex gap-2.5">
        <MessageCircleMore size={18} className="text-slate-500 stroke-[1.5] shrink-0 mt-0.5" />
        <p className="text-slate-600 text-sm leading-relaxed">
          <strong className="text-slate-700">Car Hire Tip:</strong>{' '}Just like airline tickets, car rental
          prices rise as availability drops. To secure the best rate and your preferred vehicle, don&apos;t wait
          until you land. Book your rental car now to lock in today&apos;s lower prices.
        </p>
      </div>
    </div>
  )
}
