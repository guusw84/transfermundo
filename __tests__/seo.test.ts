import { describe, it, expect } from 'vitest'
import { SITE_URL, homePageMeta, airportPageMeta } from '../lib/seo'

describe('SITE_URL', () => {
  it('is the production domain', () => {
    expect(SITE_URL).toBe('https://www.transfermundo.com')
  })
})

describe('homePageMeta', () => {
  it('includes TransferMundo in the title', () => {
    expect(homePageMeta().title).toContain('TransferMundo')
  })

  it('sets canonical to the bare site URL', () => {
    expect(homePageMeta().alternates.canonical).toBe(SITE_URL)
  })

  it('has a non-empty description', () => {
    expect(homePageMeta().description.length).toBeGreaterThan(20)
  })
})

describe('airportPageMeta', () => {
  const airport = {
    name: 'Amsterdam Airport Schiphol',
    iata: 'AMS',
    slug: 'amsterdam-airport-schiphol',
  }

  it('includes the airport name in the title', () => {
    expect(airportPageMeta(airport).title).toContain('Amsterdam Airport Schiphol')
  })

  it('includes the IATA code in the title', () => {
    expect(airportPageMeta(airport).title).toContain('AMS')
  })

  it('includes TransferMundo in the title', () => {
    expect(airportPageMeta(airport).title).toContain('TransferMundo')
  })

  it('sets canonical to the airport slug URL', () => {
    expect(airportPageMeta(airport).alternates.canonical).toBe(
      `${SITE_URL}/amsterdam-airport-schiphol`
    )
  })

  it('canonical does not contain query parameters', () => {
    const canonical = airportPageMeta(airport).alternates.canonical as string
    expect(canonical).not.toContain('?')
    expect(canonical).not.toContain('partner')
  })

  it('has a non-empty description mentioning the airport name', () => {
    expect(airportPageMeta(airport).description).toContain('Amsterdam Airport Schiphol')
  })
})
