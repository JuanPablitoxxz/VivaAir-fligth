import React, { useEffect, useState } from 'react'
import { Api } from '../api'
import SearchBar from '../components/SearchBar.jsx'
import FlightCard from '../components/FlightCard.jsx'

export default function Dashboard(){
  const [groups, setGroups] = useState({ economico: [], normal: [], preferencial: [], premium: [] })
  const [results, setResults] = useState(null)

  useEffect(() => {
    Api.dashboard().then(setGroups).catch(() => setGroups({ economico: [], normal: [], preferencial: [], premium: [] }))
  }, [])

  return (
    <div>
      <div className="hero-section">
        <h1>VivaAir</h1>
        <p>Vuelos nacionales en Colombia - Encuentra las mejores tarifas</p>
      </div>

      <div style={{ background: 'var(--bg-light)', paddingBottom: '40px' }}>
        <SearchBar onResults={setResults} />

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
                results.map(f => <FlightCard key={f.id} flight={f} variant="list" />)
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
              <h2 className="section-title">Vuelos destacados</h2>
              <p className="section-subtitle">Las mejores ofertas a destinos populares</p>
              <div className="scroll-container">
                <div className="scroll-content">
                  {[...groups.economico, ...groups.normal, ...groups.preferencial].slice(0, 8).map(f => (
                    <FlightCard key={f.id} flight={f} variant="destination" />
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="section-title">Vuelos económicos desde</h2>
              <p className="section-subtitle">Los precios más bajos para viajar por Colombia</p>
              <div className="scroll-container">
                <div className="scroll-content">
                  {groups.economico.map(f => (
                    <FlightCard key={f.id} flight={f} variant="destination" />
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="section-title">Vuelos normales</h2>
              <p className="section-subtitle">Comodidad y precio equilibrados</p>
              <div className="scroll-container">
                <div className="scroll-content">
                  {groups.normal.map(f => (
                    <FlightCard key={f.id} flight={f} variant="destination" />
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="section-title">Clase preferencial</h2>
              <p className="section-subtitle">Mayor espacio y comodidad</p>
              <div className="scroll-container">
                <div className="scroll-content">
                  {groups.preferencial.map(f => (
                    <FlightCard key={f.id} flight={f} variant="destination" />
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="section-title">Premium / Primera clase</h2>
              <p className="section-subtitle">La máxima experiencia de vuelo</p>
              <div className="scroll-container">
                <div className="scroll-content">
                  {groups.premium.map(f => (
                    <FlightCard key={f.id} flight={f} variant="destination" />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
