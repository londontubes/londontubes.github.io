export default function GlobalLoading() {
  return (
    <main className="loading-boundary" aria-busy="true" aria-label="Loading application">
      <div className="map-experience">
        <div className="map-experience__header">
          <div style={{ width: '14rem', height: '1.8rem', borderRadius: '6px', background: 'var(--surface-2)' }} />
        </div>
        <div
          className="map-shell"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-3)',
            fontSize: '0.9rem',
          }}
        >
          Loading London Tube map&hellip;
        </div>
      </div>
    </main>
  )
}
