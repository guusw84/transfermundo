import Image from 'next/image'
import { loungeUrl } from '@/lib/attribution'

export default function LoungePairBanner({ iata }: { iata: string }) {
  return (
    <section className="bg-white border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">

          {/* Copy */}
          <div className="flex-1 p-7 flex flex-col justify-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Before you fly home</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">
              Treat yourself to an airport lounge
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Skip the noise of the Departures hall. Relax in a premium airport lounge with comfortable seating,
              complimentary food and drinks, and fast WiFi. Book your lounge access in advance and skip the
              airport rush on your way home.
            </p>
            <a
              href={loungeUrl(iata)}
              target="_blank"
              rel="noopener"
              referrerPolicy="strict-origin-when-cross-origin"
              className="self-start bg-slate-900 hover:bg-slate-700 active:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-md transition"
            >
              Browse lounges at {iata} →
            </a>
          </div>

          {/* Image */}
          <div className="relative w-full sm:w-72 md:w-80 shrink-0 min-h-[200px]">
            <Image
              src="/images/partners/LoungePair.jpg"
              alt="Airport lounge"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
