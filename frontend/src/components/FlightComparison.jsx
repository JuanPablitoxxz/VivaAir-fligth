import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindowSize } from '../hooks/useWindowSize.js'
import { Api } from '../api.js'

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
  const { isMobile, isSmallMobile } = useWindowSize()
  const [priceRangeData, setPriceRangeData] = useState([])
  const [priceTrendData, setPriceTrendData] = useState([])
  const [loadingDates, setLoadingDates] = useState(false)
  const [loadingTrend, setLoadingTrend] = useState(false)
  
  // Obtener fecha base de búsqueda
  const baseDate = searchParams.date || new Date().toISOString().split('T')[0]
  
  useEffect(() => {
    if (activeTab === 'fechas' && searchParams.from && searchParams.to) {
      loadPriceRangeData()
    }
  }, [activeTab, searchParams.from, searchParams.to, baseDate])
  
  useEffect(() => {
    if (activeTab === 'tendencia' && searchParams.from && searchParams.to) {
      loadPriceTrendData()
    }
  }, [activeTab, searchParams.from, searchParams.to])
  
  const loadPriceRangeData = async () => {
    setLoadingDates(true)
    try {
      // Calcular rango de fechas: -3 días a +3 días
      const base = new Date(baseDate)
      const dates = []
      for (let i = -3; i <= 3; i++) {
        const date = new Date(base)
        date.setDate(date.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
      
      // Buscar vuelos para cada fecha
      const flightsByDate = await Promise.all(
        dates.map(async (date) => {
          try {
            const flights = await Api.searchFlights({
              from: searchParams.from,
              to: searchParams.to,
              date: date
            })
            
            // Obtener precio mínimo por aerolínea para esta fecha
            const pricesByAirline = {}
            flights.forEach(f => {
              const price = f.priceCOP || f.totalPriceCOP || 0
              if (!pricesByAirline[f.airline] || price < pricesByAirline[f.airline]) {
                pricesByAirline[f.airline] = price
              }
            })
            
            return {
              date,
              dayOffset: dates.indexOf(date) - 3,
              pricesByAirline,
              minPrice: flights.length > 0 ? Math.min(...flights.map(f => f.priceCOP || f.totalPriceCOP || 0)) : null,
              flightCount: flights.length
            }
          } catch (err) {
            console.error(`Error loading flights for ${date}:`, err)
            return {
              date,
              dayOffset: dates.indexOf(date) - 3,
              pricesByAirline: {},
              minPrice: null,
              flightCount: 0
            }
          }
        })
      )
      
      setPriceRangeData(flightsByDate)
    } catch (err) {
      console.error('Error loading price range data:', err)
    } finally {
      setLoadingDates(false)
    }
  }
  
  const loadPriceTrendData = async () => {
    setLoadingTrend(true)
    try {
      // Obtener vuelos para los próximos 30 días para analizar tendencia
      const today = new Date()
      const trendData = []
      const allFlights = []
      
      // Buscar vuelos para los próximos 7 días (muestra representativa)
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        
        try {
          const flights = await Api.searchFlights({
            from: searchParams.from,
            to: searchParams.to,
            date: dateStr
          })
          
          if (flights.length > 0) {
            const minPrice = Math.min(...flights.map(f => f.priceCOP || f.totalPriceCOP || 0))
            const avgPrice = flights.reduce((sum, f) => sum + (f.priceCOP || f.totalPriceCOP || 0), 0) / flights.length
            const maxPrice = Math.max(...flights.map(f => f.priceCOP || f.totalPriceCOP || 0))
            
            trendData.push({
              date: dateStr,
              day: i,
              minPrice,
              avgPrice,
              maxPrice,
              flightCount: flights.length
            })
            
            allFlights.push(...flights)
          }
        } catch (err) {
          console.error(`Error loading trend data for ${dateStr}:`, err)
        }
      }
      
      // Si hay vuelos, ordenar por fecha
      trendData.sort((a, b) => a.date.localeCompare(b.date))
      
      setPriceTrendData(trendData)
    } catch (err) {
      console.error('Error loading price trend data:', err)
    } finally {
      setLoadingTrend(false)
    }
  }
  
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
    <div style={{ 
      background: '#f8fafc', 
      padding: isMobile ? '16px' : '24px', 
      borderRadius: '12px', 
      marginBottom: '32px' 
    }}>
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: isMobile ? '12px' : '24px', 
        borderBottom: '2px solid #e2e8f0', 
        marginBottom: '24px', 
        paddingBottom: '8px',
        overflowX: isMobile ? 'auto' : 'visible',
        flexWrap: isMobile ? 'nowrap' : 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('aerolinea')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px 0',
            fontSize: isSmallMobile ? '12px' : isMobile ? '14px' : '16px',
            fontWeight: activeTab === 'aerolinea' ? 600 : 400,
            color: activeTab === 'aerolinea' ? '#9333ea' : '#64748b',
            borderBottom: activeTab === 'aerolinea' ? '3px solid #9333ea' : '3px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minWidth: isMobile ? 'fit-content' : 'auto'
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
            fontSize: isSmallMobile ? '12px' : isMobile ? '14px' : '16px',
            fontWeight: activeTab === 'fechas' ? 600 : 400,
            color: activeTab === 'fechas' ? '#9333ea' : '#64748b',
            borderBottom: activeTab === 'fechas' ? '3px solid #9333ea' : '3px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minWidth: isMobile ? 'fit-content' : 'auto'
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
            fontSize: isSmallMobile ? '12px' : isMobile ? '14px' : '16px',
            fontWeight: activeTab === 'tendencia' ? 600 : 400,
            color: activeTab === 'tendencia' ? '#9333ea' : '#64748b',
            borderBottom: activeTab === 'tendencia' ? '3px solid #9333ea' : '3px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minWidth: isMobile ? 'fit-content' : 'auto'
          }}
        >
          Tendencia de precios
        </button>
      </div>

      {/* Tabla de comparación */}
      {activeTab === 'aerolinea' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: isMobile ? '12px' : '20px', 
          overflowX: 'auto' 
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: isSmallMobile ? '12px' : '14px',
            minWidth: '600px'
          }}>
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
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: isMobile ? '16px' : '24px',
          overflowX: 'auto'
        }}>
          {!searchParams.from || !searchParams.to ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Selecciona origen y destino para ver precios por fecha</p>
            </div>
          ) : loadingDates ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Cargando precios...</p>
            </div>
          ) : priceRangeData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No se encontraron vuelos para el rango de fechas</p>
            </div>
          ) : (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                Precios para {searchParams.from} → {searchParams.to}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: isSmallMobile ? '11px' : '14px',
                  minWidth: '600px'
                }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                        Fecha
                      </th>
                      {airlines.map(airline => (
                        <th key={airline.airline} style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px', 
                              background: getAirlineLogo(airline.airline).bg,
                              color: getAirlineLogo(airline.airline).color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 800
                            }}>
                              {getAirlineLogo(airline.airline).char}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {airline.airline.length > 12 ? airline.airline.substring(0, 12) + '...' : airline.airline}
                            </div>
                          </div>
                        </th>
                      ))}
                      <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                        Mejor Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceRangeData.map((dateData, idx) => {
                      const date = new Date(dateData.date)
                      const isToday = dateData.dayOffset === 0
                      const dateLabel = date.toLocaleDateString('es-CO', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })
                      
                      return (
                        <tr 
                          key={dateData.date}
                          style={{ 
                            borderBottom: '1px solid #e2e8f0',
                            background: isToday ? '#f3e8ff' : 'white'
                          }}
                        >
                          <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: isToday ? 600 : 400, fontSize: '13px' }}>
                              {dateLabel}
                            </div>
                            {isToday && (
                              <div style={{ fontSize: '10px', color: '#9333ea', marginTop: '2px' }}>
                                Fecha seleccionada
                              </div>
                            )}
                          </td>
                          {airlines.map(airline => {
                            const price = dateData.pricesByAirline[airline.airline]
                            return (
                              <td key={airline.airline} style={{ textAlign: 'center', padding: '12px', verticalAlign: 'middle' }}>
                                {price ? (
                                  <div style={{ 
                                    fontWeight: 600, 
                                    fontSize: isSmallMobile ? '12px' : '14px',
                                    color: price === dateData.minPrice ? '#22c55e' : '#0f172a'
                                  }}>
                                    {formatCOP(price)}
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>-</div>
                                )}
                              </td>
                            )
                          })}
                          <td style={{ textAlign: 'center', padding: '12px', verticalAlign: 'middle' }}>
                            {dateData.minPrice ? (
                              <div style={{ 
                                fontWeight: 700, 
                                fontSize: isSmallMobile ? '13px' : '15px',
                                color: '#22c55e'
                              }}>
                                {formatCOP(dateData.minPrice)}
                              </div>
                            ) : (
                              <div style={{ fontSize: '12px', color: '#94a3b8' }}>-</div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
                💡 Compara precios para encontrar el mejor día para viajar
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tendencia' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: isMobile ? '16px' : '24px'
        }}>
          {!searchParams.from || !searchParams.to ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Selecciona origen y destino para ver la tendencia de precios</p>
            </div>
          ) : loadingTrend ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Analizando tendencia de precios...</p>
            </div>
          ) : priceTrendData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No hay suficientes datos para mostrar la tendencia</p>
            </div>
          ) : (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                Tendencia de precios: {searchParams.from} → {searchParams.to}
              </h3>
              
              {/* Gráfico de barras simple */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  justifyContent: 'space-between',
                  gap: '8px',
                  height: '200px',
                  padding: '16px',
                  borderBottom: '2px solid #e2e8f0',
                  borderLeft: '2px solid #e2e8f0',
                  position: 'relative'
                }}>
                  {priceTrendData.map((data, idx) => {
                    const maxPrice = Math.max(...priceTrendData.map(d => d.maxPrice || 0))
                    const barHeight = maxPrice > 0 ? (data.avgPrice / maxPrice) * 100 : 0
                    const date = new Date(data.date)
                    const dateLabel = date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
                    
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                          {/* Barra de precio promedio */}
                          <div style={{
                            width: '100%',
                            height: `${barHeight}%`,
                            background: 'linear-gradient(to top, #9333ea, #c084fc)',
                            borderRadius: '4px 4px 0 0',
                            position: 'relative',
                            minHeight: '20px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingTop: '4px'
                          }}>
                            <span style={{ 
                              fontSize: '10px', 
                              color: 'white', 
                              fontWeight: 600,
                              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }}>
                              {formatCOP(data.avgPrice)}
                            </span>
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: isSmallMobile ? '10px' : '11px', 
                          color: '#64748b',
                          textAlign: 'center',
                          marginTop: '8px',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          {dateLabel}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Tabla de detalles */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: isSmallMobile ? '11px' : '13px',
                  minWidth: '400px'
                }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px', fontSize: '13px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                        Fecha
                      </th>
                      <th style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                        Precio Mín.
                      </th>
                      <th style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                        Precio Prom.
                      </th>
                      <th style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                        Precio Máx.
                      </th>
                      <th style={{ textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                        Vuelos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceTrendData.map((data, idx) => {
                      const date = new Date(data.date)
                      const dateLabel = date.toLocaleDateString('es-CO', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })
                      
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px', verticalAlign: 'middle', fontWeight: 500 }}>
                            {dateLabel}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px', verticalAlign: 'middle', color: '#22c55e', fontWeight: 600 }}>
                            {formatCOP(data.minPrice)}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px', verticalAlign: 'middle', fontWeight: 600 }}>
                            {formatCOP(Math.round(data.avgPrice))}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px', verticalAlign: 'middle', color: '#dc2626', fontWeight: 600 }}>
                            {formatCOP(data.maxPrice)}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px', verticalAlign: 'middle', color: '#64748b', fontSize: '12px' }}>
                            {data.flightCount}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                📊 Análisis basado en los próximos 7 días. Los precios pueden variar según disponibilidad.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
