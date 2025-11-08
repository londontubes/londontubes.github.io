"use client"

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  style?: React.CSSProperties
  className?: string
  format?: string
  responsive?: string
  layoutKey?: string
  slot?: string // Optional explicit slot if provided later
}

// NOTE: Replace the slot ID below with an approved ad slot from your AdSense account once created.
// Until your domain is approved, ads may not render. The component still pushes to adsbygoogle queue.
const DEFAULT_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || '0000000000' // placeholder
const AD_CLIENT = 'ca-pub-1802611351208013'

export default function AdUnit({
  style,
  className,
  format = 'auto',
  responsive = 'true',
  layoutKey,
  slot,
}: AdUnitProps) {
  const insRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Guard if script not yet loaded
    // @ts-ignore
    const ads = (window.adsbygoogle = window.adsbygoogle || [])
    try {
      ads.push({})
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('AdSense push failed:', e)
    }
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <ins
        ref={insRef as any}
        className={`adsbygoogle${className ? ' ' + className : ''}`}
        style={style || { display: 'block', minHeight: 250 }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot || DEFAULT_AD_SLOT}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  )
}
