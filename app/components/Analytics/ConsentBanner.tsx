"use client"
import { useEffect, useState } from 'react'
import { setAnalyticsConsent } from '@/app/lib/analytics'

const CONSENT_KEY = 'analyticsConsent'

export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = typeof window !== 'undefined' ? localStorage.getItem(CONSENT_KEY) : null
    if (!existing) {
      setVisible(true)
    } else {
      // Apply stored consent
      if (existing === 'granted') {
        setAnalyticsConsent({ analytics_storage: 'granted', ad_storage: 'denied' })
      } else {
        setAnalyticsConsent({ analytics_storage: 'denied', ad_storage: 'denied' })
      }
    }
  }, [])

  if (!visible) return null

  function handle(choice: 'granted' | 'denied') {
    localStorage.setItem(CONSENT_KEY, choice)
    if (choice === 'granted') {
      setAnalyticsConsent({ analytics_storage: 'granted', ad_storage: 'denied' })
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
      maxWidth: '480px',
      width: '90%',
      background: 'rgba(15,23,42,0.9)',
      color: '#fff',
      padding: '1rem',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(6px)',
      fontSize: '0.9rem'
    }}>
      <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Analytics Consent</strong>
      <p style={{ margin: '0 0 0.75rem 0' }}>We use anonymous analytics (no ads) to understand feature usage (line filter, university selection). Allow?</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={() => handle('granted')} style={btnStyle}>Allow</button>
        <button onClick={() => handle('denied')} style={btnOutlineStyle}>Decline</button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  color: '#fff',
  padding: '0.55rem 1rem',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.15)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem'
}

const btnOutlineStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  color: '#fff',
  padding: '0.55rem 1rem',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.25)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem'
}

export default ConsentBanner
