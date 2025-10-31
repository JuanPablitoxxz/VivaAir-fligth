import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function formatCOP(amount) {
  return `$ ${amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
}

function getAirlineLogo(airlineName) {
  const logos = {
    'Wingo': { char: 'W', color: '#9333ea', bg: '#f3e8ff' },
    'JetSMART': { char: 'JS', color: '#dc2626', bg: '#fee2e2' },
    'LATAM Airlines Colombia': { char: 'LA', color: '#0ea5e9', bg: '#e0f2fe' },
    'Avianca': { char: 'a', color: '#dc2626', bg: '#fee2e2' },
    'Viva Air Colombia': { char: 'V', color: '#3da9fc', bg: '#e0f2fe' },
    'EasyFly': { char: 'E', color: '#10b981', bg: '#d1fae5' }
  }
  return logos[airlineName] || { char: airlineName[0], color: '#3da9fc', bg: '#e0f2fe' }
}

function getAirlineRating(airline) {
  const ratings = {
    'Avianca': { score: 6.6, label: 'Bueno' },
    'LATAM Airlines Colombia': { score: 7.9, label: 'Muy Bueno' },
    'Viva Air Colombia': { score: 7.1, label: 'Bueno' },
    'EasyFly': { score: 6.8, label: 'Bueno' },
    'Wingo': { score: 7.2, label: 'Bueno' },
    'JetSMART': { score: 7.1, label: 'Bueno' }
  }
  return ratings[airline] || { score: 6.5, label: 'Bueno' }
}

export default function FlightComparison({ groupedByAirline, searchParams = {}, selectedFlight, onSelectFlight, session }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('aerolinea')
  const airlines = Object.values(groupedByAirline)
  
  if (airlines.length === 0) {
    return null
  }

  const getDirectFlights = (airline) => {
    if (!searchParams.from || !searchParams.to) {
      return airline.flights
    }
    return airline.flights.filter(f => 
      (f.from === searchParams.from || f.from_city === searchParams.from) && 
      (f.to === searchParams.to || f.to_city === searchParams.to)
    )
  }

  const getFlightsWithStops = (airline) => {
    // Para simplificar, consideramos que si hay vuelos que no son exactamente from->to, son con escalas
    const directFlights = getDirectFlights(airline)
    return airline.flights.filter(f => !directFlights.includes(f))
  }

  const handleBuy = () => {
    if (!session) {
      if (confirm('Debes iniciar sesión para comprar un vuelo. ¿Deseas ir al login?')) {
        navigate('/login')
      }
    } else {
      navigate('/checkout', { state: { flight: selectedFlight } })
    }
  }

  return (
    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('aerolinea')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 0',
            fontSize: '16px',
            fontWeight: activeTab === 'aerolinea' ? 600 : 400,
            color: activeTab === 'aerolinea' ? '#9333ea' : '#64748b',
            borderBottom: activeTab === 'aerolinea' ? '3px solid #9333ea' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Precios por aerolínea
        </button>
        <button
          onClick={() => setActiveTab('fechas')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 0',
            fontSize: '16px',
            fontWeight: activeTab === 'fechas' ? 600 : 400,
            color: activeTab === 'fechas' ? '#9333ea' : '#64748b',
            borderBottom: activeTab === 'fechas' ? '3px solid #9333ea' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Precios +/- 3 días
        </button>
        <button
          onClick={() => setActiveTab('tendencia')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 0',
            fontSize: '16px',
            fontWeight: activeTab === 'tendencia' ? 600 : 400,
            color: activeTab === 'tendencia' ? '#9333ea' : '#64748b',
            borderBottom: activeTab === 'tendencia' ? '3px solid #9333ea' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Tendencia de precios
        </button>
      </div>

      {/* Tabla de comparación */}
      {activeTab === 'aerolinea' && (
        <div style={{ background: 'white', borderRadius: '8px', padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Aerolínea</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Directo</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Con Escalas</th>
              </tr>
            </thead>
            <tbody>
              {airlines.map((airline, index) => {
                const logo = getAirlineLogo(airline.airline)
                const rating = getAirlineRating(airline.airline)
                const directFlights = getDirectFlights(airline)
                const directPrice = directFlights.length > 0 
                  ? Math.min(...directFlights.map(f => f.priceCOP || f.totalPriceCOP || 0))
                  : null
                const stopFlights = getFlightsWithStops(airline)
                const stopPrice = stopFlights.length > 0
                  ? Math.min(...stopFlights.map(f => f.priceCOP || f.totalPriceCOP || 0))
                  : null
                
                const isSelected = selectedFlight && selectedFlight.airline === airline.airline

                return (
                  <tr 
                    key={airline.airline}
                    style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      ...(isSelected && { background: '#f3e8ff' })
                    }}
                  >
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: logo.bg,
                          color: logo.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: 800
                        }}>
                          {logo.char}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{airline.airline}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '52px' }}>
                        <div style={{
                          background: rating.label === 'Muy Bueno' ? '#16a34a' : '#22c55e',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {rating.score.toFixed(1).replace('.', ',')}
                        </div>
                        <span style={{ fontSize: '12px', color: rating.label === 'Muy Bueno' ? '#16a34a' : '#22c55e', fontWeight: 500 }}>
                          {rating.label}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      {directPrice ? (
                        <div style={{ 
                          fontWeight: 600, 
                          fontSize: '16px', 
                          color: isSelected && directPrice === Math.min(...airlines.map(a => {
                            const df = getDirectFlights(a)
                            return df.length > 0 ? Math.min(...df.map(f => f.priceCOP || f.totalPriceCOP || 0)) : Infinity
                          })) ? '#22c55e' : '#0f172a'
                        }}>
                          {formatCOP(directPrice)}
                        </div>
                      ) : (
                        <div style={{ fontSize: '14px', color: '#94a3b8' }}>-</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      {stopPrice ? (
                        <div style={{ fontWeight: 500, fontSize: '14px', color: '#64748b' }}>
                          {formatCOP(stopPrice)}
                        </div>
                      ) : (
                        <div style={{ fontSize: '14px', color: '#94a3b8' }}>-</div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'fechas' && (
        <div style={{ background: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Funcionalidad en desarrollo
        </div>
      )}

      {activeTab === 'tendencia' && (
        <div style={{ background: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Funcionalidad en desarrollo
        </div>
      )}
    </div>
  )
}
