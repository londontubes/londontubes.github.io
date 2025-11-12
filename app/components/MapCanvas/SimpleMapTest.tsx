'use client'

interface SimpleMapTestProps {
  lines?: unknown[]
  stations?: unknown[]
  [key: string]: unknown
}

export default function SimpleMapTest(props: SimpleMapTestProps) {
  console.log('SimpleMapTest received props:', Object.keys(props))
  
  return (
    <section className="map-shell" style={{ background: 'blue', minHeight: '500px' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'yellow',
        color: 'black',
        padding: '30px',
        fontSize: '24px',
        fontWeight: 'bold',
        border: '5px solid red',
        zIndex: 10000,
      }}>
        <div>SIMPLE MAP TEST - CAN YOU SEE THIS?</div>
        <div>Lines: {props.lines?.length || 0}</div>
        <div>Stations: {props.stations?.length || 0}</div>
      </div>
    </section>
  )
}
