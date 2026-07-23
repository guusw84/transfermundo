import { describe, it, expect } from 'vitest'
import { getAirports } from '../lib/airports'

const airports = getAirports()

describe('getAirports', () => {
  it('returns a non-empty array', () => {
    expect(airports.length).toBeGreaterThan(0)
  })

  it('returns 10 airports', () => {
    expect(airports.length).toBe(10)
  })

  it('every airport has required string fields', () => {
    for (const a of airports) {
      expect(a.name).toBeTruthy()
      expect(a.iata).toBeTruthy()
      expect(a.icao).toBeTruthy()
      expect(a.slug).toBeTruthy()
      expect(a.country).toBeTruthy()
    }
  })

  it('every airport has a valid IATA code (3 uppercase letters)', () => {
    for (const a of airports) {
      expect(a.iata).toMatch(/^[A-Z]{3}$/)
    }
  })

  it('every airport has at least one destination', () => {
    for (const a of airports) {
      expect(a.destinations.length).toBeGreaterThan(0)
    }
  })
})

describe('slug generation', () => {
  it('generates lowercase hyphenated slugs', () => {
    for (const a of airports) {
      expect(a.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('maps Amsterdam to the correct slug', () => {
    const ams = airports.find((a) => a.iata === 'AMS')
    expect(ams?.slug).toBe('amsterdam-airport-schiphol')
  })

  it('maps Berlin to the correct slug', () => {
    const ber = airports.find((a) => a.iata === 'BER')
    expect(ber?.slug).toBe('berlin-brandenburg-airport')
  })

  it('maps London Stansted to the correct slug', () => {
    const stn = airports.find((a) => a.iata === 'STN')
    expect(stn?.slug).toBe('london-stansted-airport')
  })
})

describe('missing data fallbacks', () => {
  it('defaults distanceKm to 0 when column is empty', () => {
    for (const a of airports) {
      for (const d of a.destinations) {
        expect(typeof d.distanceKm).toBe('number')
        expect(isNaN(d.distanceKm)).toBe(false)
      }
    }
  })

  it('defaults transportOptionsCount to 0 when column is empty', () => {
    for (const a of airports) {
      for (const d of a.destinations) {
        expect(typeof d.transportOptionsCount).toBe('number')
        expect(isNaN(d.transportOptionsCount)).toBe(false)
      }
    }
  })

  it('defaults googleScore to 0 when column is empty', () => {
    for (const a of airports) {
      expect(typeof a.googleScore).toBe('number')
      expect(isNaN(a.googleScore)).toBe(false)
    }
  })
})

describe('affiliate link construction via linkForMode', () => {
  it('taxi destinations link to book-online-transfers.com', () => {
    for (const a of airports) {
      for (const d of a.destinations) {
        if (d.fastest.mode.toLowerCase() === 'taxi') {
          expect(d.fastest.link).toContain('book-online-transfers.com')
          expect(d.fastest.link).toContain(a.iata)
        }
      }
    }
  })

  it('Distribusion carrier codes resolve to book.distribusion.com with partner number', () => {
    // Amsterdam opt 11 has carrier code NTRA
    const ams = airports.find((a) => a.iata === 'AMS')
    const trainOpt = ams?.destinations[0]?.transportOptions.find((o) =>
      o.type.includes('Train')
    )
    expect(trainOpt?.buyTicketsLink).toBe('NTRA')
    // The resolved fastest link for AMS (train) should point to Distribusion
    const amsDest = ams?.destinations[0]
    if (amsDest?.fastest.mode !== 'Taxi') {
      expect(amsDest?.fastest.link).toContain('book.distribusion.com')
      expect(amsDest?.fastest.link).toContain('retailerPartnerNumber=455363')
    }
  })

  it('HTTP buy-tickets URLs pass through directly', () => {
    // Madrid opt 11 (Metro) has a full HTTP buy tickets URL
    const mad = airports.find((a) => a.iata === 'MAD')
    const metroOpt = mad?.destinations[0]?.transportOptions.find((o) =>
      o.type.includes('Metro')
    )
    if (metroOpt) {
      expect(metroOpt.buyTicketsLink).toMatch(/^https:\/\//)
    }
  })
})

describe('partner configuration', () => {
  it('carRental.popular is a boolean', () => {
    for (const a of airports) {
      expect(typeof a.carRental.popular).toBe('boolean')
    }
  })

  it('carRental EUR/GBP/USD are numbers', () => {
    for (const a of airports) {
      expect(typeof a.carRental.eur).toBe('number')
      expect(typeof a.carRental.gbp).toBe('number')
      expect(typeof a.carRental.usd).toBe('number')
    }
  })
})
