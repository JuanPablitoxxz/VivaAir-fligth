import React from 'react'

function formatCOP(v){
  return v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function getCityInitials(city) {
  return city?.substring(0, 2).toUpperCase() || 'CO'
}

export default function FlightCard({ flight, variant = 'list' }){
  if (variant === 'destination') {
    return (
      <div className="flight-card">
        <div className="flight-card-image">
          {getCityInitials(flight.to)}
        </div>
        <div className="flight-card-content">
          <span className="tag" style={{ marginBottom: '8px' }}>VUELO</span>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>
            Vuelos a {flight.to}
          </h3>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-light)' }}>
            Partiendo desde {flight.from}
          </p>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-light)' }}>
            Por {flight.airline}
          </p>
          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--muted)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>
              Precio desde
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
              {formatCOP(flight.priceCOP)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
              {flight.durationMin} min · Sin escalas
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
        <button className="btn">Seleccionar</button>
      </div>
    </div>
  )
}
