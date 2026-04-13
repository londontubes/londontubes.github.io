import type { StationPropertySummary } from '@/app/types/property'

interface RightmoveDisplayPrice {
  displayPrice?: string
}

interface RightmovePriceDetails {
  amount?: number
  frequency?: string
  displayPrices?: RightmoveDisplayPrice[]
}

interface RightmoveFeatureProperties {
  id?: number
  price?: RightmovePriceDetails
}

interface RightmoveFeature {
  properties?: RightmoveFeatureProperties
}

interface RightmoveFeatureCollection {
  features?: RightmoveFeature[]
}

export interface RightmoveListingSample {
  listingId: string
  normalizedPrice: number
}

function extractBalancedJsonObject(source: string, startIndex: number): string | null {
  let depth = 0
  let inString = false
  let isEscaped = false

  for (let index = startIndex; index < source.length; index += 1) {
    const character = source[index]

    if (inString) {
      if (isEscaped) {
        isEscaped = false
        continue
      }

      if (character === '\\') {
        isEscaped = true
        continue
      }

      if (character === '"') {
        inString = false
      }

      continue
    }

    if (character === '"') {
      inString = true
      continue
    }

    if (character === '{') {
      depth += 1
      continue
    }

    if (character === '}') {
      depth -= 1
      if (depth === 0) {
        return source.slice(startIndex, index + 1)
      }
    }
  }

  return null
}

function extractPoundsAmount(rawValue?: string): number | null {
  if (!rawValue) return null

  const match = rawValue.match(/£([\d,]+)/)
  if (!match) return null

  const normalized = Number(match[1].replace(/,/g, ''))
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null
}

export function extractRightmoveMapFeatures(html: string): RightmoveFeature[] {
  const token = '"geoJsonProperties":'
  const tokenIndex = html.indexOf(token)

  if (tokenIndex === -1) {
    return []
  }

  const objectStart = html.indexOf('{', tokenIndex + token.length)
  if (objectStart === -1) {
    return []
  }

  const jsonPayload = extractBalancedJsonObject(html, objectStart)
  if (!jsonPayload) {
    return []
  }

  try {
    const parsed = JSON.parse(jsonPayload) as RightmoveFeatureCollection
    return parsed.features ?? []
  } catch {
    return []
  }
}

function normalizeRentPrice(price: RightmovePriceDetails | undefined): number | null {
  if (!price) return null

  const monthlyDisplayPrice = price.displayPrices
    ?.map((entry) => extractPoundsAmount(entry.displayPrice))
    .find((value) => value !== null) ?? null

  if (monthlyDisplayPrice) {
    return monthlyDisplayPrice
  }

  const amount = typeof price.amount === 'number' ? price.amount : null
  if (!amount || amount <= 0) {
    return null
  }

  const frequency = price.frequency?.toLowerCase() ?? ''
  if (frequency.includes('month')) {
    return amount
  }

  if (frequency.includes('week')) {
    return Math.round((amount * 52 / 12) * 100) / 100
  }

  return null
}

function normalizeSalePrice(price: RightmovePriceDetails | undefined): number | null {
  if (!price) return null

  if (typeof price.amount === 'number' && price.amount > 0) {
    return price.amount
  }

  return price.displayPrices
    ?.map((entry) => extractPoundsAmount(entry.displayPrice))
    .find((value) => value !== null) ?? null
}

export function extractRightmoveListingSamples(
  html: string,
  mode: 'rent' | 'buy',
): RightmoveListingSample[] {
  const features = extractRightmoveMapFeatures(html)
  const uniqueSamples = new Map<string, RightmoveListingSample>()

  features.forEach((feature, index) => {
    const listingId = String(feature.properties?.id ?? `feature-${index}`)
    const normalizedPrice = mode === 'rent'
      ? normalizeRentPrice(feature.properties?.price)
      : normalizeSalePrice(feature.properties?.price)

    if (!normalizedPrice || normalizedPrice <= 0 || uniqueSamples.has(listingId)) {
      return
    }

    uniqueSamples.set(listingId, {
      listingId,
      normalizedPrice,
    })
  })

  return Array.from(uniqueSamples.values())
}

export function calculateAveragePrice(samples: RightmoveListingSample[]): number | null {
  if (!samples.length) {
    return null
  }

  const total = samples.reduce((sum, sample) => sum + sample.normalizedPrice, 0)
  return Math.round(total / samples.length)
}

export function calculateMedianPrice(samples: RightmoveListingSample[]): number | null {
  if (!samples.length) {
    return null
  }

  const sortedPrices = samples
    .map((sample) => sample.normalizedPrice)
    .sort((left, right) => left - right)
  const midpoint = Math.floor(sortedPrices.length / 2)

  if (sortedPrices.length % 2 === 1) {
    return sortedPrices[midpoint]
  }

  return Math.round((sortedPrices[midpoint - 1] + sortedPrices[midpoint]) / 2)
}

export function formatCompactPounds(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Unavailable'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    notation: 'compact',
    maximumFractionDigits: value >= 100000 ? 1 : 0,
  }).format(value)
}

export function formatRentPcmLabel(value: number | null): string {
  return value === null ? 'Unavailable' : `${new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)} pcm`
}

export function buildStationPropertySummary(
  stationId: string,
  stationName: string,
  rentSamples: RightmoveListingSample[],
  saleSamples: RightmoveListingSample[],
): StationPropertySummary {
  return {
    stationId,
    stationName,
    medianRentPcm: calculateMedianPrice(rentSamples),
    averageSalePrice: calculateAveragePrice(saleSamples),
    rentListingCount: rentSamples.length,
    saleListingCount: saleSamples.length,
    source: 'rightmove',
  }
}