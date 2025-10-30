import React from 'react'

function formatCOP(v){
  return v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

export default function FlightCard({ flight }){
  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="tag">{flight.airline}</span>
          <span className="tag">{flight.category}</span>
          <span className="tag">{flight.durationMin} min</span>
        </div>
        <div style={{ marginTop: 6, fontWeight: 700 }}>
          {flight.from} → {flight.to}
        </div>
        <div style={{ color: '#475569', fontSize: 14 }}>
          {flight.date} · {flight.time}
        </div>
        <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
          ID {flight.id}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-dark)' }}>{formatCOP(flight.totalPriceCOP ?? flight.priceCOP)}</div>
        <button className="btn" style={{ marginTop: 8 }}>Seleccionar</button>
      </div>
    </div>
  )
}
