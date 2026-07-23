export const SITE_URL = 'https://www.transfermundo.com'

export function homePageMeta() {
  return {
    title: 'TransferMundo – Airport Transport Guides for Europe',
    description:
      'Find the best way to get from the airport to the city centre. Compare trains, buses, taxis and car rental at major European airports.',
    alternates: { canonical: SITE_URL },
  }
}

export function airportPageMeta(airport: { name: string; iata: string; slug: string }) {
  return {
    title: `${airport.name} (${airport.iata}) Transport Guide – TransferMundo`,
    description: `How to get from ${airport.name} to the city centre. Compare fastest and cheapest transport options: train, bus, metro, taxi and rental car.`,
    alternates: { canonical: `${SITE_URL}/${airport.slug}` },
    // Partner variants (?partner=) are served from the same static page.
    // The canonical above always points to the clean URL, preventing duplicate
    // content issues. The robots.txt additionally disallows partner query paths.
  }
}
