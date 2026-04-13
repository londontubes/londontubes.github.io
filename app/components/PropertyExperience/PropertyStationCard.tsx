'use client'

import type { Station } from '@/app/types/transit'
import type { StationPropertySummary } from '@/app/types/property'
import { formatCompactPounds, formatRentPcmLabel } from '@/app/lib/property/rightmoveStationPrices'

interface PropertyStationCardProps {
  station: Station
  summary?: StationPropertySummary
}

function sampleLabel(count: number, label: string): string {
  return `${count} ${label} listing${count === 1 ? '' : 's'}`
}

export default function PropertyStationCard({ station, summary }: PropertyStationCardProps) {
  const rentCount = summary?.rentListingCount ?? 0
  const saleCount = summary?.saleListingCount ?? 0
  const hasAnyData = Boolean(summary && (rentCount > 0 || saleCount > 0))

  return (
    <div style={{ minWidth: 248, maxWidth: 300 }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
        {station.displayName}
      </h3>
      <p style={{ margin: '0 0 10px', fontSize: '12px', lineHeight: 1.45, color: '#4b5563' }}>
        Current Rightmove samples within 0.5 miles.
      </p>
      <div style={{ display: 'grid', gap: '8px' }}>
        <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Average rent
          </div>
          <div style={{ marginTop: '3px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            {formatRentPcmLabel(summary?.averageRentPcm ?? null)}
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#475569' }}>
            {rentCount > 0 ? sampleLabel(rentCount, 'rental') : 'No rental listings sampled'}
          </div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Average sale
          </div>
          <div style={{ marginTop: '3px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            {formatCompactPounds(summary?.averageSalePrice ?? null)}
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#475569' }}>
            {saleCount > 0 ? sampleLabel(saleCount, 'sale') : 'No sale listings sampled'}
          </div>
        </div>
      </div>
      {!hasAnyData && (
        <p style={{ margin: '10px 0 0', fontSize: '12px', lineHeight: 1.45, color: '#6b7280' }}>
          This station does not currently have enough Rightmove map results to calculate an average.
        </p>
      )}
    </div>
  )
}