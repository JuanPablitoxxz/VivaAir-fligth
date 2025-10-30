import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Api } from '../api'
import FlightComparison from '../components/FlightComparison.jsx'
import FlightCard from '../components/FlightCard.jsx'
import SearchBar from '../components/SearchBar.jsx'

export default function FlightResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = location.state?.searchParams || {}
  const [results, setResults] = useState([])
  const [groupedByAirline, setGroupedByAirline] = useState({})
  const [sortBy, setSortBy] = useState('recomendados')
  const [filterCategory, setFilterCategory] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [session] = useState(() => {
    const raw = localStorage.getItem('vivaair.session')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (searchParams.from && searchParams.to) {
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
        grouped[flight.airline].minPrice = Math.min(grouped[flight.airline].minPrice, flight.priceCOP || flight.totalPriceCOP)
        grouped[flight.airline].maxPrice = Math.max(grouped[flight.airline].maxPrice, flight.priceCOP || flight.totalPriceCOP)
      })
      
      setGroupedByAirline(grouped)
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
        sorted.sort((a, b) => (a.priceCOP || a.totalPriceCOP) - (b.priceCOP || b.totalPriceCOP))
        break
      case 'mas_rapidos':
        sorted.sort((a, b) => (a.durationMin || 0) - (b.durationMin || 0))
        break
      case 'recomendados':
      default:
        // Mejor relación precio/duración
        sorted.sort((a, b) => {
          const scoreA = ((a.priceCOP || a.totalPriceCOP) / (a.durationMin || 1))
          const scoreB = ((b.priceCOP || b.totalPriceCOP) / (b.durationMin || 1))
          return scoreA - scoreB
        })
        break
    }
    
    return sorted
  }

  const filteredFlights = getSortedFlights()
  const cheapestFlight = filteredFlights[0]
  const fastestFlight = [...results].sort((a, b) => (a.durationMin || 0) - (b.durationMin || 0))[0]
  const recommendedFlight = filteredFlights[0]

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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Breadcrumb y nueva búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <button className="btn-outline" onClick={() => navigate('/')} style={{ marginRight: '16px' }}>
            ← Nueva búsqueda
          </button>
          <span style={{ color: 'var(--text-light)' }}>
            {searchParams.from} → {searchParams.to}
          </span>
        </div>
      </div>
      {/* Opciones de filtrado y ordenamiento */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={sortBy === 'recomendados' ? 'btn' : 'btn-outline'}
            onClick={() => setSortBy('recomendados')}
          >
            Recomendados ${recommendedFlight ? (recommendedFlight.priceCOP || recommendedFlight.totalPriceCOP).toLocaleString('es-CO') : ''}
          </button>
          <button
            className={sortBy === 'mas_baratos' ? 'btn' : 'btn-outline'}
            onClick={() => setSortBy('mas_baratos')}
          >
            Más baratos ${cheapestFlight ? (cheapestFlight.priceCOP || cheapestFlight.totalPriceCOP).toLocaleString('es-CO') : ''}
          </button>
          <button
            className={sortBy === 'mas_rapidos' ? 'btn' : 'btn-outline'}
            onClick={() => setSortBy('mas_rapidos')}
          >
            Más rápidos ${fastestFlight ? (fastestFlight.priceCOP || fastestFlight.totalPriceCOP).toLocaleString('es-CO') : ''}
          </button>
        </div>
        
        <select 
          className="input" 
          value={filterCategory} 
          onChange={e => setFilterCategory(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="todas">Todas las categorías</option>
          <option value="economico">Económico</option>
          <option value="normal">Normal</option>
          <option value="preferencial">Preferencial</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Comparación por Aerolínea */}
      {Object.keys(groupedByAirline).length > 0 && (
        <FlightComparison 
          groupedByAirline={groupedByAirline}
          searchParams={searchParams}
        />
      )}

      {/* Lista detallada de vuelos */}
      <section style={{ marginTop: '40px' }}>
        <h2 className="section-title">Vuelos Disponibles ({filteredFlights.length})</h2>
        <div className="results">
          {filteredFlights.map(flight => (
            <FlightCard 
              key={flight.id} 
              flight={flight} 
              variant="list"
              onSelect={(flight) => {
                if (!session) {
                  if (confirm('Debes iniciar sesión para comprar un vuelo. ¿Deseas ir al login?')) {
                    navigate('/login')
                  }
                } else {
                  navigate('/checkout', { state: { flight } })
                }
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

