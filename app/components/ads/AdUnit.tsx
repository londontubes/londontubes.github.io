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
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-adsense-loader="true"]')

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

    const pushAd = async () => {
      try {
        await loadAdSenseScript()

        if (cancelled || pushed.current) {
          return
        }

        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        pushed.current = true
      } catch {
        // AdSense is optional; fail silently when it cannot be loaded.
      }
    }

    if ('IntersectionObserver' in window) {
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
    } else {
      void pushAd()
    }

    return () => {
      cancelled = true
      observer?.disconnect()
    }
  }, [])

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-2691145261785175"
      data-ad-slot="4220798337"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
