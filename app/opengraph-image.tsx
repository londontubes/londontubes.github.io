import { ImageResponse } from 'next/og'

export const alt = 'London Tube Map'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #07111f 0%, #14324d 45%, #f4efe6 45%, #f4efe6 100%)',
          color: '#07111f',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '56px 64px',
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              ['Central', '#E32017'],
              ['Elizabeth', '#6950A1'],
              ['DLR', '#00A4A7'],
            ].map(([label, color]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: color,
                  color: '#ffffff',
                  borderRadius: 14,
                  padding: '10px 18px',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
            <div style={{ fontSize: 68, fontWeight: 800, color: '#ffffff', lineHeight: 1.05 }}>
              London Tube Map
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, color: '#d9e6f2', marginTop: 18 }}>
              Interactive Underground, Elizabeth line and DLR map
            </div>
            <div style={{ fontSize: 26, color: '#17324a', marginTop: 28 }}>
              Station travel times. University commute finder. 330+ stations.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#17324a' }}>
              londontubes.co.uk
            </div>
            <div style={{ fontSize: 24, color: '#33516d' }}>
              Updated for 2026
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}