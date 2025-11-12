"use client"
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView, trackEvent } from '@/app/lib/analytics'

// Tracks pageviews and outbound link clicks globally.
export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const url = searchParams && searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname
    trackPageView(url)
  }, [pathname, searchParams])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target) return
      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (!href) return
      // Ignore hash/local anchors
      if (href.startsWith('#')) return
      // Determine if external
      try {
        const url = new URL(href, window.location.href)
        if (url.host !== window.location.host) {
          trackEvent({
            action: 'outbound_click',
            category: 'outbound',
            label: url.href,
          })
        }
      } catch {
        // ignore malformed URLs
      }
    }
    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true } as any)
  }, [])

  return null
}

export default PageViewTracker
