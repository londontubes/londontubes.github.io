'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

// Resolves when window.adsbygoogle is available (handles the case where the
// global script in layout.tsx already loaded before this component mounted).
function waitForAdSense(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  // Already loaded
  if (Array.isArray((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle)) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    )

    if (!script) {
      reject(new Error('AdSense script not found'))
      return
    }

    // Script already executed but adsbygoogle not yet an array — poll briefly
    if (script.dataset.loaded === 'true') {
      resolve()
      return
    }

    const handleLoad = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    const handleError = () => reject(new Error('AdSense script failed to load'))

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    // Safety fallback: if load already fired but flag not set, resolve anyway
    const timer = window.setTimeout(() => {
      if (Array.isArray((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle)) {
        resolve()
      }
    }, 3000)

    // Clean up timer if the normal path resolves first
    script.addEventListener('load', () => window.clearTimeout(timer), { once: true })
    script.addEventListener('error', () => window.clearTimeout(timer), { once: true })
  })
}

function isNearViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect()
  return rect.top <= window.innerHeight + 300 && rect.bottom >= -300
}

interface AdUnitProps {
  style?: React.CSSProperties
  slot?: string
}

export default function AdUnit({ style, slot = '4220798337' }: AdUnitProps) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    const node = ref.current

    if (!node || pushed.current) {
      return
    }

    let cancelled = false
    let observer: IntersectionObserver | null = null
    let fallbackTimer: number | null = null

    const pushAd = async () => {
      try {
        await waitForAdSense()

        if (cancelled || pushed.current || !node.isConnected) {
          return
        }

        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        pushed.current = true
      } catch {
        // AdSense is optional; fail silently when it cannot be loaded.
      }
    }

    void waitForAdSense()

    if (isNearViewport(node)) {
      void pushAd()
    }

    if ('IntersectionObserver' in window && !pushed.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) {
            return
          }

          observer?.disconnect()
          void pushAd()
        },
        { rootMargin: '300px 0px' },
      )
      observer.observe(node)
      fallbackTimer = window.setTimeout(() => {
        void pushAd()
      }, 2500)
    } else if (!pushed.current) {
      void pushAd()
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer)
      }
    }
  }, [])

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: 'block', minHeight: '120px', ...style }}
      data-ad-client="ca-pub-2691145261785175"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
