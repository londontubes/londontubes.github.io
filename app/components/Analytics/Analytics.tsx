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

function loadGoogleAnalytics(gaId: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (typeof window.gtag === 'function') {
    return Promise.resolve()
  }

  if (gaLoadPromise) {
    return gaLoadPromise
  }

  gaLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-gtag-loader="true"]')

    const initialize = () => {
      window.dataLayer = window.dataLayer || []
      window.gtag = (...args: unknown[]) => {
        window.dataLayer?.push(args)
      }
      window.gtag('js', new Date())
      window.gtag('config', gaId)
      resolve()
    }

    const handleError = () => {
      gaLoadPromise = null
      reject(new Error('Failed to load Google Analytics'))
    }

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        initialize()
        return
      }

      existingScript.addEventListener(
        'load',
        () => {
          existingScript.dataset.loaded = 'true'
          initialize()
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
        initialize()
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

    let started = false

    const startLoading = () => {
      if (started) {
        return
      }

      started = true
      void loadGoogleAnalytics(GA_ID)
    }

    const timeoutId = window.setTimeout(startLoading, 5000)

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
