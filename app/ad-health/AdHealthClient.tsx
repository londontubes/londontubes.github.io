'use client'

import { useEffect, useState } from 'react'

import AdUnit from '@/app/components/ads/AdUnit'

import styles from './AdHealthPage.module.css'

type HealthLevel = 'good' | 'warn' | 'bad'

interface SlotSnapshot {
  index: number
  width: string
  height: string
  status: string | null
  childCount: number
  client: string | null
  slot: string | null
}

interface AdHealthSnapshot {
  adMeta: string | null
  adScriptCount: number
  slotCount: number
  consent: string | null
  scriptReady: boolean
  adsQueueReady: boolean
  gtagReady: boolean
  slotStates: SlotSnapshot[]
  generatedAt: string
}

function snapshotDom(): AdHealthSnapshot {
  const slots = Array.from(document.querySelectorAll<HTMLElement>('ins.adsbygoogle'))

  return {
    adMeta:
      document
        .querySelector('meta[name="google-adsense-account"]')
        ?.getAttribute('content') ?? null,
    adScriptCount: document.querySelectorAll(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    ).length,
    slotCount: slots.length,
    consent: window.localStorage.getItem('analyticsConsent'),
    scriptReady: typeof window !== 'undefined' && typeof window.adsbygoogle !== 'undefined',
    adsQueueReady:
      typeof window !== 'undefined' &&
      Array.isArray((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle),
    gtagReady:
      typeof window !== 'undefined' &&
      typeof (window as Window & { gtag?: unknown }).gtag === 'function',
    slotStates: slots.map((slot, index) => {
      const computed = window.getComputedStyle(slot)

      return {
        index,
        width: computed.width,
        height: computed.height,
        status: slot.getAttribute('data-ad-status'),
        childCount: slot.childNodes.length,
        client: slot.getAttribute('data-ad-client'),
        slot: slot.getAttribute('data-ad-slot'),
      }
    }),
    generatedAt: new Date().toISOString(),
  }
}

function getLevel(ok: boolean, warn = false): HealthLevel {
  if (ok) return 'good'
  if (warn) return 'warn'
  return 'bad'
}

function levelClass(level: HealthLevel) {
  if (level === 'good') return styles.good
  if (level === 'warn') return styles.warn
  return styles.bad
}

export default function AdHealthClient() {
  const [snapshot, setSnapshot] = useState<AdHealthSnapshot | null>(null)

  useEffect(() => {
    let cancelled = false

    const update = () => {
      if (!cancelled) {
        setSnapshot(snapshotDom())
      }
    }

    update()

    const timers = [500, 2000, 5000].map((delay) =>
      window.setTimeout(update, delay),
    )

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const data = snapshot

  const scriptLevel = data
    ? getLevel(data.adScriptCount > 0 && data.scriptReady, data.adScriptCount > 0)
    : 'warn'
  const consentLevel = data
    ? getLevel(data.consent === 'granted', data.consent === null)
    : 'warn'
  const slotLevel = data
    ? getLevel(data.slotCount > 0 && data.slotStates.every((slot) => slot.height !== '0px'), data.slotCount > 0)
    : 'warn'

  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <h2>Current diagnostics</h2>
        <p>
          This page checks the DOM after hydration, then samples again after the ad loader has had a chance to push slots.
          Use it to confirm that the account tag, loader, consent state, and responsive slot shells are all present.
        </p>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>AdSense scripts</p>
            <p className={styles.statValue}>{data?.adScriptCount ?? '...'}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Detected ad slots</p>
            <p className={styles.statValue}>{data?.slotCount ?? '...'}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Consent state</p>
            <p className={styles.statValue}>{data?.consent ?? 'unset'}</p>
          </div>
        </div>

        <div className={styles.statusList}>
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <strong>Loader status</strong>
              <span className={`${styles.statusTag} ${levelClass(scriptLevel)}`}>
                {scriptLevel === 'good' ? 'Ready' : scriptLevel === 'warn' ? 'Partial' : 'Missing'}
              </span>
            </div>
            <div className={styles.kv}>
              <span>Account meta: {data?.adMeta ?? 'missing'}</span>
              <span>Queue available: {data?.adsQueueReady ? 'yes' : 'no'}</span>
              <span>gtag available: {data?.gtagReady ? 'yes' : 'no'}</span>
            </div>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <strong>Consent status</strong>
              <span className={`${styles.statusTag} ${levelClass(consentLevel)}`}>
                {consentLevel === 'good' ? 'Granted' : consentLevel === 'warn' ? 'Not chosen' : 'Denied'}
              </span>
            </div>
            <p className={styles.muted}>
              Ads can still be technically wired while serving remains limited, but denied consent prevents the intended storage mode entirely.
            </p>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <strong>Slot shell status</strong>
              <span className={`${styles.statusTag} ${levelClass(slotLevel)}`}>
                {slotLevel === 'good' ? 'Visible' : slotLevel === 'warn' ? 'Mixed' : 'Collapsed'}
              </span>
            </div>
            <p className={styles.muted}>
              Zero-height slots usually indicate a rendering problem. Unfilled slots with non-zero height still prove the integration path is running.
            </p>
          </div>
        </div>

        <h3>Detected slots</h3>
        <div className={styles.slotGrid}>
          {data?.slotStates.map((slot) => (
            <div key={`${slot.slot ?? 'slot'}-${slot.index}`} className={styles.slotCard}>
              <div className={styles.statusHeader}>
                <strong>Slot {slot.index + 1}</strong>
                <span
                  className={`${styles.statusTag} ${levelClass(
                    slot.status === 'filled'
                      ? 'good'
                      : slot.status === 'unfilled' || slot.status === null
                        ? 'warn'
                        : 'bad',
                  )}`}
                >
                  {slot.status ?? 'pending'}
                </span>
              </div>
              <div className={styles.kv}>
                <span>Dimensions: {slot.width} × {slot.height}</span>
                <span>Ad client: {slot.client ?? 'missing'}</span>
                <span>Ad slot: {slot.slot ?? 'missing'}</span>
                <span>Child nodes: {slot.childCount}</span>
              </div>
            </div>
          ))}
          {data?.slotStates.length ? null : (
            <div className={styles.slotCard}>No ad slots detected yet. Refresh after hydration if this page loaded before the client settled.</div>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.button} onClick={() => setSnapshot(snapshotDom())}>
            Refresh diagnostics
          </button>
          <button className={styles.secondaryButton} onClick={() => window.localStorage.removeItem('analyticsConsent')}>
            Clear stored consent
          </button>
        </div>

        <p className={styles.timestamp}>
          Last sampled: {data ? new Date(data.generatedAt).toLocaleString() : 'waiting for hydration'}
        </p>
      </section>

      <aside className={styles.panel}>
        <h2>Live preview slot</h2>
        <p>
          This preview deliberately mounts a real responsive ad unit so you can validate loading behavior without depending on a home-page content section.
        </p>
        <div className={styles.preview}>
          <AdUnit style={{ minHeight: '160px' }} />
        </div>

        <h3>What good looks like</h3>
        <div className={styles.notesList}>
          <div className={styles.statusCard}>
            <strong>Expected integration signals</strong>
            <p className={styles.muted}>
              At least one AdSense script tag, at least one slot shell, and non-zero slot height after hydration.
            </p>
          </div>
          <div className={styles.statusCard}>
            <strong>Serving caveat</strong>
            <p className={styles.muted}>
              Localhost or headless checks may still show pending or unfilled slots. That is different from the script never loading.
            </p>
          </div>
          <div className={styles.statusCard}>
            <strong>Safe usage</strong>
            <p className={styles.muted}>
              This route is marked noindex so it can be used as an operations check without becoming a search landing page.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}