import React from 'react'

function formatCOP(amount) {
  return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

export default function FlightComparison({ groupedByAirline, searchParams = {} }) {
  const airlines = Object.values(groupedByAirline)
  
  if (airlines.length === 0) {
    return null
  }

  // Obtener vuelos directos y con escalas por aerolínea
  const getDirectFlights = (airline) => {
    if (!searchParams.from || !searchParams.to) {
      return airline.flights
    }
    return airline.flights.filter(f => 
      (f.from === searchParams.from || f.from_city === searchParams.from) && 
      (f.to === searchParams.to || f.to_city === searchParams.to)
    )
  }

  const getFlightsByCategory = (airline, category) => {
    return airline.flights.filter(f => f.category === category)
  }

  // Obtener vuelo recomendado (más barato con buena duración)
  const allFlights = airlines.flatMap(a => a.flights)
  const recommendedFlight = allFlights.length > 0 
    ? allFlights.sort((a, b) => {
        const scoreA = ((a.priceCOP || a.totalPriceCOP || 0) / (a.durationMin || 1))
        const scoreB = ((b.priceCOP || b.totalPriceCOP || 0) / (b.durationMin || 1))
        return scoreA - scoreB
      })[0]
    : null

  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <h2 style={{ marginTop: 0 }}>Comparación de Aerolíneas</h2>
      
      {/* Tabla de comparación */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--muted)' }}>
              <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Aerolínea</th>
              <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Rating</th>
              <th style={{ textAlign: 'right', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Directo</th>
              <th style={{ textAlign: 'right', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Con Escalas</th>
              <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Categorías</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map(airline => {
              const directFlights = getDirectFlights(airline)
              const directPrice = directFlights.length > 0 
                ? Math.min(...directFlights.map(f => f.priceCOP || f.totalPriceCOP))
                : null
              
              const allPrices = airline.flights.map(f => f.priceCOP || f.totalPriceCOP)
              const minPrice = Math.min(...allPrices)
              const maxPrice = Math.max(...allPrices)
              
              return (
                <tr key={airline.airline} style={{ borderBottom: '1px solid var(--muted)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{airline.airline}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      {airline.flights.length} vuelos disponibles
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{airline.rating.score}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{airline.rating.label}</div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px' }}>
                    {directPrice ? (
                      <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary)' }}>
                        {formatCOP(directPrice)}
                      </div>
                    ) : (
                      <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                        {formatCOP(minPrice)}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {formatCOP(minPrice)} {maxPrice > minPrice ? `- ${formatCOP(maxPrice)}` : ''}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {['economico', 'normal', 'preferencial', 'premium'].map(cat => {
                        const count = getFlightsByCategory(airline, cat).length
                        if (count === 0) return null
                        return (
                          <span 
                            key={cat}
                            className="tag" 
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            {cat[0].toUpperCase() + cat.slice(1)} ({count})
                          </span>
                        )
                      })}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Vuelo Recomendado */}
      {recommendedFlight && (
        <div style={{ marginTop: '32px', padding: '24px', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)', borderRadius: '8px', color: 'white' }}>
          <h3 style={{ marginTop: 0, color: 'white' }}>⭐ Vuelo Recomendado</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>✈️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px' }}>
                    {(recommendedFlight.from || recommendedFlight.from_city)} → {(recommendedFlight.to || recommendedFlight.to_city)}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {new Date(recommendedFlight.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} · {recommendedFlight.time}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                  {(recommendedFlight.durationMin || recommendedFlight.duration_min)} min
                </span>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                  {recommendedFlight.airline}
                </span>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                  {recommendedFlight.category}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Precio Final</div>
              <div style={{ fontSize: '36px', fontWeight: 800 }}>
                {formatCOP(recommendedFlight.priceCOP || recommendedFlight.totalPriceCOP || recommendedFlight.total_price_cop || 0)}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>1 persona</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

