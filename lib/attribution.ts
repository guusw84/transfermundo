// Central registry for all commercial outbound URLs.
// All affiliate IDs, partner numbers, and ref tags live here.

const TAXI_BASE = 'https://www.book-online-transfers.com/en/airmundo-airport-taxi'
const DISTRIBUSION_BASE = 'https://book.distribusion.com/'
const RENTAL_CARS_BASE = 'https://www.rentalcars.com/en/'
const LOUNGE_BASE = 'https://www.loungepair.com/at/'

// ─── URL Builders ─────────────────────────────────────────────────────────────

export function taxiUrl(iata: string): string {
  return `${TAXI_BASE}?from_iata_code=${iata}`
}

export function distribusionUrl(carrierCode: string): string {
  const p = new URLSearchParams({
    marketingCarrierCode: carrierCode,
    currency: 'EUR',
    locale: 'en',
    retailerPartnerNumber: '455363',
  })
  return `${DISTRIBUSION_BASE}?${p}`
}

export function rentalCarUrl(): string {
  return RENTAL_CARS_BASE
}

export function loungeUrl(iata: string): string {
  return `${LOUNGE_BASE}${iata}/?ref=mundo`
}

/**
 * Resolves a CSV buy-tickets value to the correct outbound URL.
 * Priority: 4-letter Distribusion carrier code → full HTTP URL → timetable fallback
 */
export function buildOutboundUrl(buyTicketsValue: string, timetableLink: string): string {
  const code = buyTicketsValue?.trim()
  if (code && /^[A-Z]{4}$/.test(code)) return distribusionUrl(code)
  if (code?.startsWith('http')) return code
  return timetableLink
}

// ─── First-party click logger ──────────────────────────────────────────────────
// Call from client components only. Non-blocking — never interrupts navigation.

export type OutboundSurface = 'taxi' | 'rental-car' | 'tickets' | 'lounge' | 'timetable'

export function trackOutbound(surface: OutboundSurface, meta?: Record<string, string>): void {
  if (typeof window === 'undefined') return
  try {
    import('@vercel/analytics').then(({ track }) => {
      track('outbound_click', { surface, ...meta })
    }).catch(() => undefined)
  } catch {
    // Non-blocking
  }
}
