export default function NotFound() {
  return (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0' }}>404</h1>
      <h2 style={{ margin: '20px 0' }}>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a 
        href="/"
        style={{
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
        }}
      >
        Go Home
      </a>
    </div>
  )
}
