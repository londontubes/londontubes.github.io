'use client'

import { useMemo, useState } from 'react'
import type { Station } from '@/app/types/transit'
import type { StationPropertySummary } from '@/app/types/property'
import { trackRightmoveClick, trackZooplaClick } from '@/app/lib/analytics'
import {
  buildRightmoveStationBuyUrls,
  buildRightmoveStationUrls,
  buildZooplaStationBuyUrl,
  buildZooplaStationUrl,
} from '@/app/lib/map/propertySearch'
import { formatCompactPounds, formatRentPcmLabel } from '@/app/lib/property/rightmoveStationPrices'

interface PropertyStationCardProps {
  station: Station
  summary?: StationPropertySummary
  lineLabels: Record<string, string>
  lineColorMap: Record<string, string>
}

type PropertySearchPanel = 'rent' | 'sale' | null

interface PropertySearchAction {
  key: string
  label: string
  url: string
  partner: 'zoopla' | 'rightmove'
  placement: string
}

function sampleLabel(count: number, label: string): string {
  return `${count} ${label} listing${count === 1 ? '' : 's'}`
}

function SearchActions({
  stationName,
  actions,
}: {
  stationName: string
  actions: PropertySearchAction[]
}) {
  if (actions.length === 0) {
    return (
      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        No property search link available for this station yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
      {actions.map((action) => (
        <a
          key={action.key}
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (action.partner === 'zoopla') {
              trackZooplaClick(stationName, {
                placement: action.placement,
                intentSegment: 'commuter-rentals',
                href: action.url,
              })
              return
            }

            trackRightmoveClick(stationName, {
              placement: action.placement,
              intentSegment: 'commuter-rentals',
              href: action.url,
            })
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '34px',
            padding: '8px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.01em',
            textDecoration: 'none',
            background: action.partner === 'zoopla' ? '#6f2cff' : '#00deb6',
            color: action.partner === 'zoopla' ? '#ffffff' : '#05231d',
          }}
        >
          {action.label}
        </a>
      ))}
    </div>
  )
}

export default function PropertyStationCard({ station, summary, lineLabels, lineColorMap }: PropertyStationCardProps) {
  const rentCount = summary?.rentListingCount ?? 0
  const saleCount = summary?.saleListingCount ?? 0
  const hasAnyData = Boolean(summary && (rentCount > 0 || saleCount > 0))
  const [openPanel, setOpenPanel] = useState<PropertySearchPanel>(null)

  const rentActions = useMemo<PropertySearchAction[]>(() => {
    const actions: PropertySearchAction[] = []
    const zooplaUrl = buildZooplaStationUrl(station)
    if (zooplaUrl) {
      actions.push({
        key: 'rent-zoopla',
        label: 'Zoopla rent',
        url: zooplaUrl,
        partner: 'zoopla',
        placement: 'property-card-rent',
      })
    }

    buildRightmoveStationUrls(station).forEach((link, index) => {
      actions.push({
        key: `rent-rightmove-${index}`,
        label: link.label,
        url: link.url,
        partner: 'rightmove',
        placement: 'property-card-rent',
      })
    })

    return actions
  }, [station])

  const saleActions = useMemo<PropertySearchAction[]>(() => {
    const actions: PropertySearchAction[] = []
    const zooplaUrl = buildZooplaStationBuyUrl(station)
    if (zooplaUrl) {
      actions.push({
        key: 'sale-zoopla',
        label: 'Zoopla buy',
        url: zooplaUrl,
        partner: 'zoopla',
        placement: 'property-card-sale',
      })
    }

    buildRightmoveStationBuyUrls(station).forEach((link, index) => {
      actions.push({
        key: `sale-rightmove-${index}`,
        label: link.label,
        url: link.url,
        partner: 'rightmove',
        placement: 'property-card-sale',
      })
    })

    return actions
  }, [station])

  const renderMetricCard = ({
    tone,
    label,
    value,
    description,
    panel,
    actions,
  }: {
    tone: { background: string; border: string; labelColor: string }
    label: string
    value: string
    description: string
    panel: Exclude<PropertySearchPanel, null>
    actions: PropertySearchAction[]
  }) => (
    <div>
      <button
        type="button"
        onClick={() => setOpenPanel((current) => (current === panel ? null : panel))}
        aria-expanded={openPanel === panel}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '12px 14px',
          borderRadius: '12px',
          background: tone.background,
          border: `1px solid ${tone.border}`,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: tone.labelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
            {openPanel === panel ? 'Hide links' : 'Search links'}
          </div>
        </div>
        <div style={{ marginTop: '4px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          {value}
        </div>
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#475569' }}>
          {description}
        </div>
      </button>
      {openPanel === panel && <SearchActions stationName={station.displayName} actions={actions} />}
    </div>
  )

  return (
    <div
      style={{
        minWidth: 248,
        maxWidth: 320,
        padding: '14px',
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
      }}
    >
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
        {station.displayName}
      </h3>
      <p style={{ margin: '0 0 10px', fontSize: '12px', lineHeight: 1.45, color: '#4b5563' }}>
        Current Rightmove samples within 0.5 miles.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {station.lineCodes.map((lineCode) => (
          <span
            key={lineCode}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '24px',
              padding: '4px 8px',
              borderRadius: '999px',
              background: lineColorMap[lineCode] ?? '#2563eb',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {lineLabels[lineCode] ?? lineCode}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        {renderMetricCard({
          tone: {
            background: '#eff6ff',
            border: '#bfdbfe',
            labelColor: '#1d4ed8',
          },
          label: 'Median rent',
          value: formatRentPcmLabel(summary?.medianRentPcm ?? null),
          description: rentCount > 0 ? sampleLabel(rentCount, 'rental') : 'No rental listings sampled',
          panel: 'rent',
          actions: rentActions,
        })}
        {renderMetricCard({
          tone: {
            background: '#ecfdf5',
            border: '#a7f3d0',
            labelColor: '#047857',
          },
          label: 'Average sale',
          value: formatCompactPounds(summary?.averageSalePrice ?? null),
          description: saleCount > 0 ? sampleLabel(saleCount, 'sale') : 'No sale listings sampled',
          panel: 'sale',
          actions: saleActions,
        })}
      </div>
      {!hasAnyData && (
        <p style={{ margin: '10px 0 0', fontSize: '12px', lineHeight: 1.45, color: '#6b7280' }}>
          This station does not currently have enough Rightmove map results to calculate an average.
        </p>
      )}
    </div>
  )
}