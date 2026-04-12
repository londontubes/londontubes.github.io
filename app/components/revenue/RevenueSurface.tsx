'use client'

import { useEffect, useRef } from 'react'

import AdUnit from '@/app/components/ads/AdUnit'
import { trackRevenueClick, trackRevenueSurfaceView } from '@/app/lib/analytics'
import type { RevenueIntentSegment } from '@/app/lib/revenue'

import styles from './RevenueSurface.module.css'

interface RevenueSurfaceProps {
  title: string
  description: string
  partner: string
  placement: string
  intentSegment: RevenueIntentSegment
  href?: string | null
  ctaLabel?: string
  eyebrow?: string
  compact?: boolean
  kind?: 'affiliate' | 'ad'
}

export function RevenueSurface({
  title,
  description,
  partner,
  placement,
  intentSegment,
  href,
  ctaLabel,
  eyebrow,
  compact = false,
  kind = 'affiliate',
}: RevenueSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasTrackedView = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node || hasTrackedView.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasTrackedView.current) return
        hasTrackedView.current = true
        trackRevenueSurfaceView({
          partner,
          placement,
          intentSegment,
          href: href ?? undefined,
        })
        observer.disconnect()
      },
      { threshold: 0.35 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [href, intentSegment, partner, placement])

  const className = compact ? `${styles.surface} ${styles.compact}` : styles.surface

  return (
    <div ref={ref} className={className}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {kind === 'ad' ? (
        <div className={styles.adShell}>
          <AdUnit style={{ minHeight: '120px' }} />
        </div>
      ) : href ? (
        <a
          className={styles.cta}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          onClick={() =>
            trackRevenueClick({
              partner,
              placement,
              intentSegment,
              href,
              label: ctaLabel ?? title,
            })
          }
        >
          {ctaLabel ?? 'Open offer'}
        </a>
      ) : null}
    </div>
  )
}

export default RevenueSurface