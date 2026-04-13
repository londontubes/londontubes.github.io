'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

let adSenseLoadPromise: Promise<void> | null = null

function loadAdSenseScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (adSenseLoadPromise) {
    return adSenseLoadPromise
  }

  adSenseLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    )

    if (existingScript?.dataset.loaded === 'true') {
      resolve()
      return
    }

    const handleLoad = () => {
      if (existingScript) {
        existingScript.dataset.loaded = 'true'
      }
      resolve()
    }

    const handleError = () => {
      adSenseLoadPromise = null
      reject(new Error('Failed to load AdSense script'))
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2691145261785175'
    script.dataset.adsenseLoader = 'true'
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', handleError, { once: true })
    document.head.appendChild(script)
  })

  return adSenseLoadPromise
}

function isNearViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect()
  return rect.top <= window.innerHeight + 300 && rect.bottom >= -300
}

interface AdUnitProps {
  style?: React.CSSProperties
}

export default function AdUnit({ style }: AdUnitProps) {
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
        await loadAdSenseScript()

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

    void loadAdSenseScript()

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
      data-ad-slot="4220798337"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
