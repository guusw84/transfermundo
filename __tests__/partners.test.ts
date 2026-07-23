import { describe, it, expect } from 'vitest'
import { PARTNERS } from '../lib/partners'

describe('PARTNERS config', () => {
  it('contains the four defined partners', () => {
    expect(PARTNERS).toHaveProperty('ryanair')
    expect(PARTNERS).toHaveProperty('wizzair')
    expect(PARTNERS).toHaveProperty('sas')
    expect(PARTNERS).toHaveProperty('rtm')
  })

  it('every partner has a name, logoSrc, and heroBg', () => {
    for (const [key, config] of Object.entries(PARTNERS)) {
      expect(config.name, `${key} missing name`).toBeTruthy()
      expect(config.logoSrc, `${key} missing logoSrc`).toBeTruthy()
      expect(config.heroBg, `${key} missing heroBg`).toBeTruthy()
    }
  })

  it('partner keys are lowercase', () => {
    for (const key of Object.keys(PARTNERS)) {
      expect(key).toBe(key.toLowerCase())
    }
  })

  it('logoSrc paths start with /images/partners/', () => {
    for (const config of Object.values(PARTNERS)) {
      expect(config.logoSrc).toMatch(/^\/images\/partners\//)
    }
  })

  it('heroBg paths start with /images/partners/', () => {
    for (const config of Object.values(PARTNERS)) {
      expect(config.heroBg).toMatch(/^\/images\/partners\//)
    }
  })

  it('unknown partner key returns undefined', () => {
    expect(PARTNERS['unknown']).toBeUndefined()
    expect(PARTNERS['google']).toBeUndefined()
  })

  it('partner lookup is case-sensitive (keys must be lowercase)', () => {
    // Consumers should always lowercase before lookup — verify uppercase fails
    expect(PARTNERS['Ryanair']).toBeUndefined()
    expect(PARTNERS['RYANAIR']).toBeUndefined()
  })
})
