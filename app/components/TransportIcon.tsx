import {
  CarTaxiFront,
  CarFront,
  BusFront,
  TrainFront,
  SquareM,
  TrainFrontTunnel,
  TramFront,
  Ship,
  ArrowRightLeft,
  Zap,
} from 'lucide-react'

const cls = 'stroke-[1.5] text-slate-500'

function BaseIcon({ k }: { k: string }) {
  const key = k.trim().toLowerCase()
  if (key === 'taxi')        return <CarTaxiFront size={18} className={cls} />
  if (key === 'car rental')  return <CarFront     size={18} className={cls} />
  if (key === 'bus')         return <BusFront     size={18} className={cls} />
  if (key === 'train')   return <TrainFront       size={18} className={cls} />
  if (key === 'metro')   return <SquareM          size={18} className={cls} />
  if (key === 's-bahn')  return <TrainFrontTunnel size={18} className={cls} />
  if (key === 'tram')    return <TramFront        size={18} className={cls} />
  if (key === 'boat')    return <Ship             size={18} className={cls} />
  if (key === 'apm')     return (
    <div className="border border-slate-200 rounded p-0.5 inline-flex">
      <ArrowRightLeft size={13} className={cls} />
    </div>
  )
  return null
}

export default function TransportIcon({ type }: { type: string }) {
  const stripped = type.replace(/^Public transport\s+/i, '').trim()
  const lower = stripped.toLowerCase()

  // Exact matches — express services
  if (lower === 'bus service') {
    return (
      <span className="inline-flex items-center gap-0.5">
        <BusFront size={18} className={cls} />
        <Zap size={10} className="stroke-[1.5] text-slate-400" />
      </span>
    )
  }
  if (lower === 'train service') {
    return (
      <span className="inline-flex items-center gap-0.5">
        <TrainFront size={18} className={cls} />
        <Zap size={10} className="stroke-[1.5] text-slate-400" />
      </span>
    )
  }

  // Combination routes — split on '+'
  if (stripped.includes('+')) {
    const parts = stripped.split('+')
    return (
      <span className="inline-flex items-center gap-1">
        {parts.map((part, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            {i > 0 && <span className="text-slate-400 text-xs leading-none">+</span>}
            <BaseIcon k={part} />
          </span>
        ))}
      </span>
    )
  }

  // Single base icon
  return <BaseIcon k={stripped} />
}
