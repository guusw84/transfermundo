import { describe, it, expect } from 'vitest'
import {
  taxiUrl,
  distribusionUrl,
  rentalCarUrl,
  loungeUrl,
  buildOutboundUrl,
} from '../lib/attribution'

describe('taxiUrl', () => {
  it('includes the IATA code as from_iata_code param', () => {
    expect(taxiUrl('AMS')).toBe(
      'https://www.book-online-transfers.com/en/airmundo-airport-taxi?from_iata_code=AMS'
    )
  })

  it('works for any IATA code', () => {
    expect(taxiUrl('MAD')).toContain('from_iata_code=MAD')
  })
})

describe('distribusionUrl', () => {
  it('includes the carrier code', () => {
    const url = distribusionUrl('NTRA')
    expect(url).toContain('marketingCarrierCode=NTRA')
  })

  it('always includes the retailer partner number', () => {
    expect(distribusionUrl('STEX')).toContain('retailerPartnerNumber=455363')
  })

  it('sets currency to EUR and locale to en', () => {
    const url = distribusionUrl('DBAH')
    expect(url).toContain('currency=EUR')
    expect(url).toContain('locale=en')
  })

  it('points to book.distribusion.com', () => {
    expect(distribusionUrl('NEXP')).toMatch(/^https:\/\/book\.distribusion\.com\//)
  })
})

describe('rentalCarUrl', () => {
  it('returns the rentalcars.com base URL', () => {
    expect(rentalCarUrl()).toBe('https://www.rentalcars.com/en/')
  })
})

describe('loungeUrl', () => {
  it('includes the IATA code in the path', () => {
    expect(loungeUrl('AMS')).toBe('https://www.loungepair.com/at/AMS/?ref=mundo')
  })

  it('always includes the ref=mundo attribution tag', () => {
    expect(loungeUrl('LHR')).toContain('ref=mundo')
  })
})

describe('buildOutboundUrl', () => {
  const timetable = 'https://www.ns.nl/en'

  it('returns Distribusion URL for a 4-letter carrier code', () => {
    const url = buildOutboundUrl('NTRA', timetable)
    expect(url).toContain('marketingCarrierCode=NTRA')
    expect(url).toContain('retailerPartnerNumber=455363')
  })

  it('trims whitespace from carrier codes', () => {
    const url = buildOutboundUrl('  STEX  ', timetable)
    expect(url).toContain('marketingCarrierCode=STEX')
  })

  it('returns the HTTP URL directly when buy tickets is a full URL', () => {
    const ticketUrl = 'https://www.bvg.de/de/tickets'
    expect(buildOutboundUrl(ticketUrl, timetable)).toBe(ticketUrl)
  })

  it('falls back to timetable link when buy tickets value is empty', () => {
    expect(buildOutboundUrl('', timetable)).toBe(timetable)
  })

  it('falls back to timetable link when buy tickets value is undefined-like', () => {
    // Short non-code strings (not 4-letter all-caps, not http) → timetable
    expect(buildOutboundUrl('N/A', timetable)).toBe(timetable)
  })

  it('does not route lowercase strings to Distribusion', () => {
    // Carrier codes must be uppercase; lowercase should fall through
    expect(buildOutboundUrl('ntra', timetable)).toBe(timetable)
  })

  it('does not route 3-letter strings to Distribusion', () => {
    expect(buildOutboundUrl('AMS', timetable)).toBe(timetable)
  })
})
