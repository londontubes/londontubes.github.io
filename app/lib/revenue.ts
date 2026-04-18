export type RevenueIntentSegment =
  | 'student-housing'
  | 'commuter-rentals'
  | 'airport-transfer'
  | 'travel-essentials'
  | 'tourist-experiences'

export type GygExperienceKey =
  | 'heathrow-express'
  | 'stansted-express'
  | 'gatwick-transfer'
  | 'london-pass'
  | 'tower-of-london'
  | 'thames-cruise'
  | 'harry-potter-tour'
  | 'frameless'

const GYG_EXPERIENCE_URLS: Record<GygExperienceKey, string | undefined> = {
  'heathrow-express': process.env.NEXT_PUBLIC_GYG_HEATHROW_EXPRESS_AFFILIATE_URL,
  'stansted-express': process.env.NEXT_PUBLIC_GYG_STANSTED_EXPRESS_AFFILIATE_URL,
  'gatwick-transfer': process.env.NEXT_PUBLIC_GYG_GATWICK_TRANSFER_AFFILIATE_URL,
  'london-pass': process.env.NEXT_PUBLIC_GYG_LONDON_PASS_AFFILIATE_URL,
  'tower-of-london': process.env.NEXT_PUBLIC_GYG_TOWER_OF_LONDON_AFFILIATE_URL,
  'thames-cruise': process.env.NEXT_PUBLIC_GYG_THAMES_CRUISE_AFFILIATE_URL,
  'harry-potter-tour': process.env.NEXT_PUBLIC_GYG_HARRY_POTTER_TOUR_AFFILIATE_URL,
  'frameless': process.env.NEXT_PUBLIC_GYG_FRAMELESS_AFFILIATE_URL,
}

export function getGygExperienceUrl(key: GygExperienceKey): string | null {
  const url = GYG_EXPERIENCE_URLS[key]
  return url && url.trim() ? url : null
}

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
  return getGygExperienceUrl('heathrow-express')
}

export function getAmazonAssociatesTag(): string | null {
  const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG
  return tag && tag.trim() ? tag : null
}

// Builds an Amazon.co.uk search URL with the associates tag appended so
// commission is attributed. Returns null if the tag isn't configured, so
// callers can fall back to a dead-link treatment (same pattern as the
// other affiliate URLs in this module).
export function buildAmazonSearchUrl(query: string): string | null {
  const tag = getAmazonAssociatesTag()
  if (!tag) return null
  const params = new URLSearchParams({ k: query, tag })
  return `https://www.amazon.co.uk/s?${params.toString()}`
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