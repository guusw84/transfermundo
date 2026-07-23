import { Leaf } from 'lucide-react'
import TransportIcon from '@/app/components/TransportIcon'
import { buildOutboundUrl } from '@/lib/attribution'
import type { TransportOption } from '@/lib/airports'

function isEcoFriendly(type: string): boolean {
  const t = type.toLowerCase()
  return t.includes('train') || t.includes('bus') || t.includes('metro') ||
    t.includes('s-bahn') || t.includes('u-bahn') || t.includes('tram')
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

interface Props {
  opt: TransportOption
}

export default function TransportOptionCard({ opt }: Props) {
  return (
    <div className="bg-white rounded-lg border border-slate-100 p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-900 text-xs font-semibold px-2.5 py-1 rounded-md">
              <TransportIcon type={opt.type} />
              {opt.type}
            </span>
            {isEcoFriendly(opt.type) && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                <Leaf size={14} className="text-emerald-600 stroke-[1.5]" />
                Eco-friendly
              </span>
            )}
          </div>
          <p className="font-bold tracking-tight text-slate-900 text-xl leading-snug">{opt.serviceName}</p>
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
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">{opt.priceAdult}</p>
            <p className="text-slate-400 text-xs">adults · one-way</p>
            <p className="text-slate-600 text-sm mt-0.5">
              {opt.priceChild} <span className="text-slate-400">children</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href={buildOutboundUrl(opt.buyTicketsLink, opt.timetableLink)}
              target="_blank"
              rel="noopener"
              referrerPolicy="strict-origin-when-cross-origin"
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-4 py-2 rounded-md transition text-center"
            >
              Buy tickets →
            </a>
            <a
              href={opt.timetableLink}
              target="_blank"
              rel="noopener"
              referrerPolicy="strict-origin-when-cross-origin"
              className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-sm font-semibold px-4 py-2 rounded-md transition text-center"
            >
              Timetable →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
