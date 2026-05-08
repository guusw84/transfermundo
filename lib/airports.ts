import { readFileSync } from 'fs'
import { join } from 'path'
import { parse } from 'csv-parse/sync'

export interface TransportOption {
  type: string
  boardingLocation: string
  serviceName: string
  operator: string
  mainStations: string
  timetableLink: string
  travelTime: string
  frequency: string
  priceAdult: string
  priceChild: string
}

export interface Destination {
  name: string
  gygQuery?: string
  cityCenter: string
  distanceKm: number
  distanceMiles: number
  transportOptionsCount: number
  fastest: { mode: string; time: string; price: string; link: string }
  cheapest: { mode: string; time: string; price: string; link: string }
  taxi: { time: string; fare: string }
  transportOptions: TransportOption[]
}

export interface Airport {
  slug: string
  name: string
  iata: string
  icao: string
  country: string
  continent: string
  address: string
  location: string
  alsoKnownAs: string
  terminals: string
  passengers2023: string
  operator: string
  goodToKnow: string
  moneySavingTip: string
  appPublicTransport: string
  googleScore: number
  googleReviews: string
  carRental: { location: string; eur: number; gbp: number; usd: number; popular: boolean }
  lastUpdate: string
  destinations: Destination[]
}

// Overrides for the GYG widget city query.
// null = suppress the widget for that destination.
// string = use this city instead of the destination name.
// absent = use the destination name as-is.
const GYG_OVERRIDES: Record<string, Record<string, string | null>> = {
  TGD: { Podgorica: null },
  CIY: { Comiso: null },
  TIV: { Tivat: 'Kotor' },
}

function gygQuery(iata: string, destName: string): string | undefined {
  const overrides = GYG_OVERRIDES[iata]
  if (overrides && destName in overrides) {
    const v = overrides[destName]
    return v === null ? undefined : v
  }
  return destName
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function col(row: Record<string, string>, key: string): string {
  return row[key]?.trim() ?? ''
}

function parseTransportOption(
  row: Record<string, string>,
  n: number,
  m: number
): TransportOption | null {
  const key = `${n}${m}`
  const type = col(row, `Transportation option ${key}`)
  if (!type) return null
  return {
    type,
    boardingLocation: col(row, `Location station/stop at airport ${key}`),
    serviceName: col(row, `Service name ${key}`),
    operator: col(row, `Operator ${key}`),
    mainStations: col(row, `Main stations ${key}`),
    timetableLink: col(row, `Timetable link ${key}`),
    travelTime: col(row, `Travel time ${key}`),
    frequency: col(row, `Frequency ${key}`),
    priceAdult: col(row, `One-way adults ${key}`),
    priceChild: col(row, `One-way children ${key}`),
  }
}

function linkForMode(
  mode: string,
  iata: string,
  options: TransportOption[]
): string {
  if (mode.toLowerCase() === 'taxi') {
    return `https://www.book-online-transfers.com/en/airmundo-airport-taxi?from_iata_code=${iata}`
  }
  return options.find((o) => o.type === mode)?.timetableLink ?? ''
}

function parseDestination(
  row: Record<string, string>,
  n: number,
  iata: string
): Destination | null {
  const name = col(row, `Destination ${n}`)
  if (!name) return null

  const options = ([1, 2, 3] as const)
    .map((m) => parseTransportOption(row, n, m))
    .filter((o): o is TransportOption => o !== null)

  const fastestMode = col(row, `Fastest ${n}1`)
  const cheapestMode = col(row, `Cheapest ${n}1`)
  const query = gygQuery(iata, name)

  return {
    name,
    ...(query !== undefined && { gygQuery: query }),
    cityCenter: col(row, `City centre ${n}`),
    distanceKm: parseFloat(col(row, `Distance to city centre km ${n}`)) || 0,
    distanceMiles: parseFloat(col(row, `Distance to city centre miles ${n}`)) || 0,
    transportOptionsCount: parseInt(col(row, `Transport options including taxi ${n}`)) || 0,
    fastest: {
      mode: fastestMode,
      time: col(row, `Fastest ${n}2`),
      price: col(row, `Fastest ${n}3`),
      link: linkForMode(fastestMode, iata, options),
    },
    cheapest: {
      mode: cheapestMode,
      time: col(row, `Cheapest ${n}2`),
      price: col(row, `Cheapest ${n}3`),
      link: linkForMode(cheapestMode, iata, options),
    },
    taxi: {
      time: col(row, `Taxi - Travel time to city centre ${n}`),
      fare: col(row, `Taxi fare ${n}`),
    },
    transportOptions: options,
  }
}

let _cache: Airport[] | null = null

export function getAirports(): Airport[] {
  if (_cache) return _cache

  const csvPath = join(process.cwd(), 'data', 'airports.csv')
  const content = readFileSync(csvPath, 'utf-8')
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: false, // we trim ourselves per-field
  }) as Record<string, string>[]

  _cache = rows.map((row) => {
    const iata = col(row, 'IATA airport code')
    const numDests = parseInt(col(row, 'Number of destinations')) || 0

    const destinations = ([1, 2, 3] as const)
      .slice(0, numDests)
      .map((n) => parseDestination(row, n, iata))
      .filter((d): d is Destination => d !== null)

    return {
      slug: slugify(col(row, 'Airport name')),
      name: col(row, 'Airport name'),
      iata,
      icao: col(row, 'ICAO airport code'),
      country: col(row, 'Country'),
      continent: col(row, 'Continent'),
      address: col(row, 'Address'),
      location: col(row, 'Location'),
      alsoKnownAs: col(row, 'Also known as'),
      terminals: col(row, 'Number of terminals'),
      passengers2023: col(row, 'Number of passengers 2023'),
      operator: col(row, 'Airport operator'),
      goodToKnow: col(row, 'Good to know'),
      moneySavingTip: col(row, 'Money-saving tip'),
      appPublicTransport: col(row, 'App public transport tickets'),
      googleScore: parseFloat(col(row, 'Google airport score')) || 0,
      googleReviews: `${col(row, 'Number of reviews')}K`,
      carRental: {
        location: col(row, 'Car rental - Location car rental companies'),
        eur: parseFloat(col(row, 'Car rental EUR')) || 0,
        gbp: parseFloat(col(row, 'Car rental GBP')) || 0,
        usd: parseFloat(col(row, 'Car rental USD')) || 0,
        popular: col(row, 'Car rental populair').toLowerCase() === 'yes',
      },
      lastUpdate: col(row, 'Last update'),
      destinations,
    }
  })

  return _cache
}
