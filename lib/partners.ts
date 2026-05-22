export interface Partner {
  name: string
  logoSrc: string
}

export const PARTNERS: Record<string, Partner> = {
  ryanair: { name: 'Ryanair', logoSrc: '/images/partners/ryanair.svg' },
  wizzair: { name: 'Wizz Air', logoSrc: '/images/partners/wizzair.svg' },
  sas: { name: 'Scandinavian Airlines', logoSrc: '/images/partners/sas.svg' },
  rtm: { name: 'Rotterdam The Hague Airport', logoSrc: '/images/partners/rtm.svg' },
}
