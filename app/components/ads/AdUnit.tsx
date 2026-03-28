'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  style?: React.CSSProperties
}

export default function AdUnit({ style }: AdUnitProps) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {
      // adsbygoogle not ready yet
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
