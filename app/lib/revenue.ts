export type RevenueIntentSegment =
  | 'student-housing'
  | 'commuter-rentals'
  | 'airport-transfer'

const AMBER_AFFILIATE_URLS: Record<string, string | undefined> = {
  UCL: process.env.NEXT_PUBLIC_AMBER_UCL_AFFILIATE_URL,
  IMPERIAL: process.env.NEXT_PUBLIC_AMBER_IMPERIAL_AFFILIATE_URL,
  LSE: process.env.NEXT_PUBLIC_AMBER_LSE_AFFILIATE_URL,
  KINGS: process.env.NEXT_PUBLIC_AMBER_KINGS_AFFILIATE_URL,
  QMUL: process.env.NEXT_PUBLIC_AMBER_QMUL_AFFILIATE_URL,
  CITY: process.env.NEXT_PUBLIC_AMBER_CITY_AFFILIATE_URL,
  SOAS: process.env.NEXT_PUBLIC_AMBER_SOAS_AFFILIATE_URL,
  WESTMINSTER: process.env.NEXT_PUBLIC_AMBER_WESTMINSTER_AFFILIATE_URL,
}

export function getAmberAffiliateUrl(universityId?: string | null): string | null {
  if (!universityId) return null
  return AMBER_AFFILIATE_URLS[universityId] ?? null
}

export function getHeathrowExpressAffiliateUrl(): string | null {
  return process.env.NEXT_PUBLIC_GYG_HEATHROW_EXPRESS_AFFILIATE_URL ?? null
}

export function withRevenueAttribution(
  url: string,
  options: {
    partner: string
    placement: string
    intentSegment: RevenueIntentSegment
  }
): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.set('utm_source', 'londontubes.co.uk')
    parsed.searchParams.set('utm_medium', options.partner)
    parsed.searchParams.set('utm_campaign', options.intentSegment)
    parsed.searchParams.set('utm_content', options.placement)
    return parsed.toString()
  } catch {
    return url
  }
}