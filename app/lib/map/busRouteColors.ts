interface BusRouteColor {
  brand: string
  text: string
}

const FALLBACK_BUS_ROUTE_COLOR: BusRouteColor = {
  brand: '#D62B1F',
  text: '#FFFFFF',
}

function normalizeRouteCode(routeCode: string): string {
  return routeCode.trim().toLowerCase()
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const normalizedHue = ((hue % 360) + 360) % 360
  const normalizedSaturation = Math.max(0, Math.min(100, saturation)) / 100
  const normalizedLightness = Math.max(0, Math.min(100, lightness)) / 100

  const chroma = (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation
  const huePrime = normalizedHue / 60
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1))

  let red = 0
  let green = 0
  let blue = 0

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma
    green = x
  } else if (huePrime >= 1 && huePrime < 2) {
    red = x
    green = chroma
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma
    blue = x
  } else if (huePrime >= 3 && huePrime < 4) {
    green = x
    blue = chroma
  } else if (huePrime >= 4 && huePrime < 5) {
    red = x
    blue = chroma
  } else {
    red = chroma
    blue = x
  }

  const match = normalizedLightness - chroma / 2
  const toHex = (value: number) => Math.round((value + match) * 255).toString(16).padStart(2, '0')

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase()
}

function getRelativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '')
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(normalized.slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function createRouteColor(index: number, total: number, usedColors: Set<string>): BusRouteColor {
  const hueBase = total <= 0 ? 0 : (index / total) * 360
  const saturationSteps = [68, 74, 80, 86]
  const lightnessSteps = [40, 46, 52, 58]
  let attempt = 0

  while (attempt < 64) {
    const saturation = saturationSteps[(index + attempt) % saturationSteps.length]
    const lightness = lightnessSteps[(Math.floor(index / saturationSteps.length) + attempt) % lightnessSteps.length]
    const hue = hueBase + attempt * (360 / 29)
    const brand = hslToHex(hue, saturation, lightness)

    if (!usedColors.has(brand)) {
      usedColors.add(brand)
      return {
        brand,
        text: getRelativeLuminance(brand) > 0.42 ? '#111111' : '#FFFFFF',
      }
    }

    attempt += 1
  }

  return FALLBACK_BUS_ROUTE_COLOR
}

export function buildBusRouteColorMap(routeCodes: string[]): Record<string, BusRouteColor> {
  const uniqueRouteCodes = Array.from(
    new Set(routeCodes.map((routeCode) => routeCode.trim()).filter(Boolean))
  ).sort(new Intl.Collator('en-GB', { numeric: true, sensitivity: 'base' }).compare)

  const usedColors = new Set<string>()
  const colorMap: Record<string, BusRouteColor> = {}

  uniqueRouteCodes.forEach((routeCode, index) => {
    colorMap[normalizeRouteCode(routeCode)] = createRouteColor(index, uniqueRouteCodes.length, usedColors)
  })

  return colorMap
}

export function getBusRouteColor(routeCode: string, routeColorMap?: Record<string, BusRouteColor>): BusRouteColor {
  const normalizedRouteCode = normalizeRouteCode(routeCode)

  if (routeColorMap?.[normalizedRouteCode]) {
    return routeColorMap[normalizedRouteCode]
  }

  return FALLBACK_BUS_ROUTE_COLOR
}