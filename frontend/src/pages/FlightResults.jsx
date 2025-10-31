import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Api } from '../api'
import { supabase } from '../lib/supabase'
import FlightComparison from '../components/FlightComparison.jsx'
import FlightCard from '../components/FlightCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { useWindowSize } from '../hooks/useWindowSize.js'

function formatCOP(amount) {
  return `$ ${amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
}

export default function FlightResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = location.state?.searchParams || {}
  const [results, setResults] = useState([])
  const [groupedByAirline, setGroupedByAirline] = useState({})
  const [sortBy, setSortBy] = useState('recomendados')
  const [filterCategory, setFilterCategory] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [session] = useState(() => {
    const raw = localStorage.getItem('vivaair.session')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if ((searchParams.from && searchParams.to) || searchParams.category || searchParams.to) {
      loadFlights()
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const loadFlights = async () => {
    setLoading(true)
    try {
      const flights = await Api.searchFlights(searchParams)
      setResults(flights || [])
      
      // Agrupar por aerolínea
      const grouped = {}
      flights.forEach(flight => {
        if (!grouped[flight.airline]) {
          grouped[flight.airline] = {
            airline: flight.airline,
            flights: [],
            minPrice: Infinity,
            maxPrice: 0,
            rating: getAirlineRating(flight.airline)
          }
        }
        grouped[flight.airline].flights.push(flight)
        grouped[flight.airline].minPrice = Math.min(grouped[flight.airline].minPrice, flight.priceCOP || flight.totalPriceCOP || 0)
        grouped[flight.airline].maxPrice = Math.max(grouped[flight.airline].maxPrice, flight.priceCOP || flight.totalPriceCOP || 0)
      })
      
      setGroupedByAirline(grouped)
      
      // Seleccionar vuelo recomendado por defecto
      if (flights.length > 0 && !selectedFlight) {
        const recommended = flights.sort((a, b) => {
          const scoreA = ((a.priceCOP || a.totalPriceCOP || 0) / (a.durationMin || 1))
          const scoreB = ((b.priceCOP || b.totalPriceCOP || 0) / (b.durationMin || 1))
          return scoreA - scoreB
        })[0]
        setSelectedFlight(recommended)
      }
    } catch (err) {
      console.error('Error loading flights:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getAirlineRating = (airline) => {
    const ratings = {
      'Avianca': { score: 6.6, label: 'Bueno' },
      'LATAM Airlines Colombia': { score: 7.9, label: 'Muy Bueno' },
      'Viva Air Colombia': { score: 7.1, label: 'Bueno' },
      'EasyFly': { score: 6.8, label: 'Bueno' },
      'Wingo': { score: 7.2, label: 'Bueno' }
    }
    return ratings[airline] || { score: 6.5, label: 'Bueno' }
  }

  const getSortedFlights = () => {
    let sorted = [...results]
    
    // Filtrar por categoría
    if (filterCategory !== 'todas') {
      sorted = sorted.filter(f => f.category === filterCategory)
    }
    
    // Ordenar
    switch (sortBy) {
      case 'mas_baratos':
        sorted.sort((a, b) => (a.priceCOP || a.totalPriceCOP || 0) - (b.priceCOP || b.totalPriceCOP || 0))
        break
      case 'mas_rapidos':
        sorted.sort((a, b) => (a.durationMin || 0) - (b.durationMin || 0))
        break
      case 'recomendados':
      default:
        sorted.sort((a, b) => {
          const scoreA = ((a.priceCOP || a.totalPriceCOP || 0) / (a.durationMin || 1))
          const scoreB = ((b.priceCOP || b.totalPriceCOP || 0) / (b.durationMin || 1))
          return scoreA - scoreB
        })
        break
    }
    
    return sorted
  }

  const filteredFlights = getSortedFlights()
  const cheapestFlight = filteredFlights.length > 0 ? filteredFlights[0] : null
  const fastestFlight = results.length > 0 ? [...results].sort((a, b) => (a.durationMin || 0) - (b.durationMin || 0))[0] : null
  const recommendedFlight = filteredFlights.length > 0 ? filteredFlights[0] : null

  const handleBuy = () => {
    if (!session) {
      if (confirm('Debes iniciar sesión para comprar un vuelo. ¿Deseas ir al login?')) {
        navigate('/login')
      }
    } else if (selectedFlight) {
      navigate('/checkout', { state: { flight: selectedFlight } })
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando vuelos...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div>
        <div style={{ background: 'var(--bg-light)', paddingBottom: '40px' }}>
          <SearchBar onResults={() => {}} showResultsInline={false} />
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px', margin: '40px auto', maxWidth: '600px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-light)' }}>No se encontraron vuelos para tu búsqueda</p>
          <button className="btn" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>
            Nueva Búsqueda
          </button>
        </div>
      </div>
    )
  }

  const { isMobile, isSmallMobile } = useWindowSize()

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: isSmallMobile ? '12px' : isMobile ? '16px' : '24px', 
      background: '#f8fafc', 
      minHeight: '100vh' 
    }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <button className="btn-outline" onClick={() => navigate('/')} style={{ marginRight: '16px' }}>
          ← Nueva búsqueda
        </button>
        <span style={{ color: 'var(--text-light)' }}>
          {searchParams.category ? (
            <>Vuelos {searchParams.category[0].toUpperCase() + searchParams.category.slice(1)}</>
          ) : searchParams.to ? (
            <>Destino: {searchParams.to}</>
          ) : (
            <>{searchParams.from || 'Origen'} → {searchParams.to || 'Destino'}</>
          )}
        </span>
      </div>

      {/* Tabla de comparación */}
      {Object.keys(groupedByAirline).length > 0 && (
        <FlightComparison 
          groupedByAirline={groupedByAirline}
          searchParams={searchParams}
          selectedFlight={selectedFlight}
          onSelectFlight={setSelectedFlight}
          session={session}
        />
      )}

      {/* Botones de filtro y recomendación */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px', 
        flexWrap: 'wrap', 
        alignItems: 'center',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
      }}>
        <button
          onClick={() => {
            setSortBy('recomendados')
            if (recommendedFlight) setSelectedFlight(recommendedFlight)
          }}
          style={{
            background: sortBy === 'recomendados' ? '#9333ea' : 'white',
            color: sortBy === 'recomendados' ? 'white' : '#64748b',
            border: sortBy === 'recomendados' ? 'none' : '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: sortBy === 'recomendados' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Recomendados {recommendedFlight ? formatCOP(recommendedFlight.priceCOP || recommendedFlight.totalPriceCOP || 0) : ''}
        </button>
        <button
          onClick={() => {
            setSortBy('mas_baratos')
            if (cheapestFlight) setSelectedFlight(cheapestFlight)
          }}
          style={{
            background: sortBy === 'mas_baratos' ? '#9333ea' : 'white',
            color: sortBy === 'mas_baratos' ? 'white' : '#64748b',
            border: sortBy === 'mas_baratos' ? 'none' : '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: sortBy === 'mas_baratos' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Más baratos {cheapestFlight ? formatCOP(cheapestFlight.priceCOP || cheapestFlight.totalPriceCOP || 0) : ''}
        </button>
        <button
          onClick={() => {
            setSortBy('mas_rapidos')
            if (fastestFlight) setSelectedFlight(fastestFlight)
          }}
          style={{
            background: sortBy === 'mas_rapidos' ? '#9333ea' : 'white',
            color: sortBy === 'mas_rapidos' ? 'white' : '#64748b',
            border: sortBy === 'mas_rapidos' ? 'none' : '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: sortBy === 'mas_rapidos' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Más rápidos {fastestFlight ? formatCOP(fastestFlight.priceCOP || fastestFlight.totalPriceCOP || 0) : ''}
        </button>
        <div style={{ 
          marginLeft: isMobile ? '0' : 'auto',
          width: isMobile ? '100%' : 'auto'
        }}>
          <button
            style={{
              background: 'transparent',
              color: '#9333ea',
              border: '1px solid #9333ea',
              borderRadius: '24px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}
          >
            🔔 Crear alerta de precio
          </button>
        </div>
      </div>

      {/* Detalle del vuelo seleccionado */}
      {selectedFlight && (
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: isMobile ? '16px' : '24px', 
          marginBottom: '24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
        }}>
          {/* IDA */}
          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>✈️</span>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>IDA</span>
              <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '8px' }}>
                {new Date(selectedFlight.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr', 
              gap: '16px', 
              alignItems: 'center' 
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                  {selectedFlight.from || selectedFlight.from_city} → {selectedFlight.to || selectedFlight.to_city}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {selectedFlight.airline}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{selectedFlight.time}</div>
                <div style={{ 
                  display: 'inline-block',
                  background: '#22c55e',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  Directo
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                  {selectedFlight.time && (() => {
                    const [hours, mins] = selectedFlight.time.split(':')
                    const arrival = new Date(new Date().setHours(parseInt(hours), parseInt(mins)))
                    arrival.setMinutes(arrival.getMinutes() + (selectedFlight.durationMin || selectedFlight.duration_min || 0))
                    return arrival.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                  })()}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {selectedFlight.durationMin || selectedFlight.duration_min} min
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <span style={{ fontSize: '20px' }}>🧳</span>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Equipaje</span>
              <span style={{ marginLeft: 'auto', cursor: 'pointer' }}>▼</span>
            </div>
          </div>

          {/* REGRESO (si existe) */}
          {/* Por ahora solo mostramos IDA para vuelos simples */}

          {/* Precio final y compra */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center', 
            marginTop: '24px',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            gap: window.innerWidth <= 768 ? '16px' : '0'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Final 1 persona</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: isSmallMobile ? '24px' : '32px', 
                  fontWeight: 800, 
                  color: '#0f172a' 
                }}>
                  {formatCOP(selectedFlight.priceCOP || selectedFlight.totalPriceCOP || 0)}
                </span>
                <span style={{ fontSize: '18px', color: '#64748b', cursor: 'pointer' }}>ℹ️</span>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'center',
              width: isMobile ? '100%' : 'auto'
            }}>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ❤️
              </button>
              <button
                onClick={handleBuy}
                style={{
                  background: '#9333ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
                  flex: isMobile ? 1 : 'none'
                }}
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de vuelos disponibles */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 700 }}>Todos los vuelos disponibles ({filteredFlights.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredFlights.map(flight => (
            <div
              key={flight.id}
              onClick={() => setSelectedFlight(flight)}
              style={{
                padding: '16px',
                border: selectedFlight?.id === flight.id ? '2px solid #9333ea' : '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedFlight?.id === flight.id ? '#faf5ff' : 'white',
                transition: 'all 0.2s'
              }}
            >
              <FlightCard 
                flight={flight} 
                variant="list"
                onSelect={() => setSelectedFlight(flight)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
