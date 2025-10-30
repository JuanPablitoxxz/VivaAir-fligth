import React from 'react'

function formatCOP(v){
  return v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function getCityImageUrl(city) {
  const cityMap = {
    'Bogotá': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400',
    'Medellín': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    'Cali': 'https://images.unsplash.com/photo-1587330979470-3585acb56371?w=400',
    'Cartagena': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400',
    'Barranquilla': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
    'Bucaramanga': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
    'Pereira': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'Santa Marta': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
    'Cúcuta': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'Ibagué': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  }
  return cityMap[city] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`
}

export default function FlightCard({ flight, variant = 'destination', onSelect }){
  if (variant === 'destination') {
    const hours = Math.floor(flight.durationMin / 60)
    const mins = flight.durationMin % 60
    const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    
    return (
      <div className="flight-destination-card">
        <div className="flight-card-image-container">
          <img 
            src={getCityImageUrl(flight.to)} 
            alt={flight.to}
            className="flight-card-image"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div className="flight-card-image-fallback" style={{ display: 'none' }}>
            {flight.to.substring(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="flight-card-content">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
            {flight.to}
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-light)' }}>
            {duration}, non-stop
          </p>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-light)' }}>
            {formatDate(flight.date)} ▸ {formatDate(new Date(new Date(flight.date).getTime() + 3*24*60*60*1000).toISOString().split('T')[0])}
          </p>
          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--muted)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>
              from
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
              {formatCOP(flight.priceCOP).replace('COP', '$')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <span className="tag">{flight.airline}</span>
          <span className="tag">{flight.category}</span>
          <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>{flight.durationMin} min</span>
        </div>
        <div style={{ marginBottom: 8, fontWeight: 700, fontSize: '18px' }}>
          {flight.from} → {flight.to}
        </div>
        <div style={{ color: 'var(--text-light)', fontSize: 14 }}>
          {new Date(flight.date).toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} · {flight.time}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 12 }}>
          {formatCOP(flight.totalPriceCOP ?? flight.priceCOP)}
        </div>
        <button className="btn" onClick={() => onSelect && onSelect(flight)}>Seleccionar</button>
      </div>
    </div>
  )
}
