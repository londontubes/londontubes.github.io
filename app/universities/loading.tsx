/**
 * Loading State for Universities Page
 * 
 * Displayed while the universities data is being loaded.
 */

export default function Loading() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        padding: '20px'
      }}>
        <div 
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #0066cc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
          role="status"
          aria-label="Loading universities data"
        />
        <p style={{ marginTop: '16px', color: '#666' }}>
          Loading universities data...
        </p>
      </div>
    </>
  )
}
