export interface Partner {
  name: string
  logoSrc: string
  heroBg: string
}

export const PARTNERS: Record<string, Partner> = {
  ryanair: { name: 'Ryanair', logoSrc: '/images/partners/ryanair.svg', heroBg: '/images/partners/ryanair-hero.webp' },
  wizzair: { name: 'Wizz Air', logoSrc: '/images/partners/wizzair.svg', heroBg: '/images/partners/wizzair-hero.webp' },
  sas: { name: 'Scandinavian Airlines', logoSrc: '/images/partners/sas.svg', heroBg: '/images/partners/sas-hero.webp' },
  rtm: { name: 'Rotterdam The Hague Airport', logoSrc: '/images/partners/rtm.svg', heroBg: '/images/partners/rtm-hero.webp' },
}
