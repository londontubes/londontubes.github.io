"use client"
import { useEffect, useState } from 'react'
import { setAnalyticsConsent } from '@/app/lib/analytics'

const CONSENT_KEY = 'analyticsConsent'

export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = typeof window !== 'undefined' ? localStorage.getItem(CONSENT_KEY) : null
    if (!existing) {
      const revealBanner = () => setVisible(true)
      const timeoutId = window.setTimeout(revealBanner, 15000)
      const interactionOptions: AddEventListenerOptions = { once: true, passive: true }

      window.addEventListener('pointerdown', revealBanner, interactionOptions)
      window.addEventListener('keydown', revealBanner, { once: true })

      return () => {
        window.clearTimeout(timeoutId)
        window.removeEventListener('pointerdown', revealBanner)
        window.removeEventListener('keydown', revealBanner)
      }
    } else {
      // Apply stored consent
      if (existing === 'granted') {
        setAnalyticsConsent({ analytics_storage: 'granted', ad_storage: 'granted' })
      } else {
        setAnalyticsConsent({ analytics_storage: 'denied', ad_storage: 'denied' })
      }
    }
  }, [])

  if (!visible) return null

  function handle(choice: 'granted' | 'denied') {
    localStorage.setItem(CONSENT_KEY, choice)
    if (choice === 'granted') {
      setAnalyticsConsent({ analytics_storage: 'granted', ad_storage: 'granted' })
    } else {
      setAnalyticsConsent({ analytics_storage: 'denied', ad_storage: 'denied' })
    }
    setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 5000,
      maxWidth: 'calc(100% - 2rem)',
      width: 'auto',
      background: 'rgba(15,23,42,0.9)',
      color: '#fff',
      padding: '0.75rem 0.875rem',
      borderRadius: '999px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(6px)',
      fontSize: '0.8rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
        <span style={{ fontSize: '0.74rem', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Analytics & ads?</span>
        <button onClick={() => handle('granted')} style={btnStyle}>Allow</button>
        <button onClick={() => handle('denied')} style={btnOutlineStyle}>Decline</button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  color: '#fff',
  padding: '0.45rem 0.85rem',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.15)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.78rem'
}

const btnOutlineStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  color: '#fff',
  padding: '0.45rem 0.85rem',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.25)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.78rem'
}

export default ConsentBanner
