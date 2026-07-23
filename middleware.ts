import { NextRequest, NextResponse } from 'next/server'

// Allowed embedding domains per partner key
const PARTNER_FRAME_DOMAINS: Record<string, string> = {
  ryanair: 'https://*.ryanair.com',
  wizzair: 'https://*.wizzair.com',
  sas:     'https://*.sas.com https://*.flysas.com',
  rtm:     'https://*.rotterdamthehagueairport.nl',
}

const CSP_BASE = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.getyourguide.com https://*.easyterra.com https://*.distribusion.com https://*.rentalcars.com https://*.book-online-transfers.com https://book-online-transfers.com https://*.loungepair.com https://*.googletagmanager.com https://*.google-analytics.com",
  "script-src-elem 'self' 'unsafe-inline' https://*.getyourguide.com https://*.easyterra.com https://*.distribusion.com https://*.rentalcars.com https://*.book-online-transfers.com https://book-online-transfers.com https://*.loungepair.com https://*.googletagmanager.com https://*.google-analytics.com",
  "connect-src 'self' https:",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "frame-src 'self' https://*.getyourguide.com https://*.easyterra.com https://*.distribusion.com https://*.rentalcars.com https://*.book-online-transfers.com https://book-online-transfers.com https://*.loungepair.com",
].join('; ')

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const partner = request.nextUrl.searchParams.get('partner')?.toLowerCase()
  const partnerDomain = partner ? PARTNER_FRAME_DOMAINS[partner] : undefined

  const frameAncestors = partnerDomain
    ? `frame-ancestors 'self' ${partnerDomain}`
    : "frame-ancestors 'self'"

  response.headers.set('Content-Security-Policy', `${CSP_BASE}; ${frameAncestors}`)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
