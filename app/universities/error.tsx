'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2>Something went wrong!</h2>
      <p style={{ color: '#666', marginTop: '10px' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
