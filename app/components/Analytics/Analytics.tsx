"use client"
import { useEffect } from 'react'

const GA_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ??
  process.env.NEXT_PUBLIC_GA_ID ??
  'G-9Q194F9FKG'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let gaLoadPromise: Promise<void> | null = null
let gaScriptInitialized = false

// Install the gtag/dataLayer shim synchronously on mount so trackEvent()
// calls made before googletagmanager.com/gtag/js finishes downloading are
// queued in window.dataLayer instead of dropped. When the real script
// loads, it reads dataLayer and processes queued commands.
function installGtagShim(gaId: string) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', gaId)
  }
}

function loadGoogleAnalytics(gaId: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (gaScriptInitialized) {
    return Promise.resolve()
  }

  if (gaLoadPromise) {
    return gaLoadPromise
  }

  gaLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-gtag-loader="true"]')

    const onReady = () => {
      gaScriptInitialized = true
      resolve()
    }

    const handleError = () => {
      gaLoadPromise = null
      reject(new Error('Failed to load Google Analytics'))
    }

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        onReady()
        return
      }

      existingScript.addEventListener(
        'load',
        () => {
          existingScript.dataset.loaded = 'true'
          onReady()
        },
        { once: true },
      )
      existingScript.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    script.dataset.gtagLoader = 'true'
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true'
        onReady()
      },
      { once: true },
    )
    script.addEventListener('error', handleError, { once: true })
    document.head.appendChild(script)
  })

  return gaLoadPromise
}

export function Analytics() {
  useEffect(() => {
    if (!GA_ID) {
      return
    }

    // Shim installed synchronously so events queue from the first paint.
    installGtagShim(GA_ID)

    let started = false

    const startLoading = () => {
      if (started) {
        return
      }

      started = true
      void loadGoogleAnalytics(GA_ID)
    }

    // 1s idle timeout (was 5s) — dramatically shrinks the window in which
    // an affiliate click can land before gtag.js is in flight.
    const timeoutId = window.setTimeout(startLoading, 1000)

    const interactionOptions: AddEventListenerOptions = { once: true, passive: true }
    window.addEventListener('pointerdown', startLoading, interactionOptions)
    window.addEventListener('scroll', startLoading, interactionOptions)
    window.addEventListener('keydown', startLoading, { once: true })

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('pointerdown', startLoading)
      window.removeEventListener('scroll', startLoading)
      window.removeEventListener('keydown', startLoading)
    }
  }, [])

  useEffect(() => {
    const thresholds = [25, 50, 75, 90]
    const fired = new Set<number>()

    const send = (percent: number) => {
      if (!window.gtag || fired.has(percent)) {
        return
      }

      fired.add(percent)
      window.gtag('event', 'scroll_depth', {
        event_category: 'engagement',
        event_label: String(percent),
        value: percent,
      })
    }

    const check = () => {
      const doc = document.documentElement
      const scrollTop = window.pageYOffset || doc.scrollTop
      const scrollHeight = doc.scrollHeight - doc.clientHeight

      if (scrollHeight <= 0) {
        return
      }

      const percent = Math.round((scrollTop / scrollHeight) * 100)
      thresholds.forEach((threshold) => {
        if (percent >= threshold) {
          send(threshold)
        }
      })
    }

    window.addEventListener('scroll', check, { passive: true })
    check()

    return () => {
      window.removeEventListener('scroll', check)
    }
  }, [])

  return null
}

export default Analytics
