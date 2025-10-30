import React, { useEffect, useState } from 'react'
import { Api } from '../api'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar.jsx'
import FlightCard from '../components/FlightCard.jsx'
import DestinationCard from '../components/DestinationCard.jsx'
import FlightTypeCard from '../components/FlightTypeCard.jsx'

export default function Dashboard(){
  const [results, setResults] = useState(null)
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('vivaair.session')
    return raw ? JSON.parse(raw) : null
  })
  const navigate = useNavigate()

  const popularDestinations = ['Cartagena', 'Medellín', 'Cali', 'Santa Marta', 'Barranquilla']
  const handleDestinationClick = (city) => {
    // Navegar a página de resultados con comparación
    navigate('/results', { 
      state: { 
        searchParams: { 
          to: city,
          passengers: 1 
        } 
      } 
    })
  }
  
  const handleFlightTypeClick = (category) => {
    // Navegar a página de resultados filtrando por tipo de vuelo
    navigate('/results', { 
      state: { 
        searchParams: { 
          category: category,
          passengers: 1 
        } 
      } 
    })
  }

  return (
    <div>
      <div className="hero-section">
        <h1>VivaAir</h1>
        <p>Vuelos nacionales en Colombia - Encuentra las mejores tarifas</p>
      </div>

      <div style={{ background: 'var(--bg-light)', paddingBottom: '40px' }}>
        <SearchBar onResults={setResults} showResultsInline={true} />

        {results ? (
          <section style={{ padding: '0 24px', marginTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="section-title" style={{ margin: '0' }}>Resultados de búsqueda</h2>
              <button className="btn-outline" onClick={() => { setResults(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                Nueva búsqueda
              </button>
            </div>
            <div className="results">
              {results.length > 0 ? (
                results.map(f => (
                  <FlightCard 
                    key={f.id} 
                    flight={f} 
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
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ fontSize: '18px', color: 'var(--text-light)' }}>No se encontraron vuelos para tu búsqueda</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <section style={{ marginTop: '60px' }}>
              <h2 className="section-title">Destinos más visitados</h2>
              <p className="section-subtitle">Los lugares favoritos para viajar en Colombia</p>
              <div className="scroll-container">
                <div className="scroll-content">
                  {popularDestinations.map(city => (
                    <DestinationCard 
                      key={city} 
                      city={city} 
                      isPopular={true}
                      onClick={() => handleDestinationClick(city)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section style={{ marginTop: '60px' }}>
              <h2 className="section-title">Tipos de vuelo</h2>
              <p className="section-subtitle">Elige la opción que mejor se adapte a tus necesidades</p>
              <div className="scroll-container">
                <div className="scroll-content">
                  <FlightTypeCard type="economico" onSearchFlights={handleFlightTypeClick} />
                  <FlightTypeCard type="normal" onSearchFlights={handleFlightTypeClick} />
                  <FlightTypeCard type="preferencial" onSearchFlights={handleFlightTypeClick} />
                  <FlightTypeCard type="premium" onSearchFlights={handleFlightTypeClick} />
                </div>
              </div>
            </section>

            <section style={{ marginTop: '60px' }}>
              <h2 className="section-title">Tipos de vuelo</h2>
              <p className="section-subtitle">Elige la opción que mejor se adapte a tus necesidades</p>
              <div className="scroll-container">
                <div className="scroll-content">
                  <FlightTypeCard type="economico" onSearchFlights={handleFlightTypeClick} />
                  <FlightTypeCard type="normal" onSearchFlights={handleFlightTypeClick} />
                  <FlightTypeCard type="preferencial" onSearchFlights={handleFlightTypeClick} />
                  <FlightTypeCard type="premium" onSearchFlights={handleFlightTypeClick} />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
