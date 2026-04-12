import { ImageResponse } from 'next/og'

export const size = {
  width: 64,
  height: 64,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07111f',
          color: '#f4f4f5',
          borderRadius: 14,
          fontSize: 34,
          fontWeight: 800,
          fontFamily: 'sans-serif',
          border: '4px solid #14324d',
        }}
      >
        LT
      </div>
    ),
    size,
  )
}
