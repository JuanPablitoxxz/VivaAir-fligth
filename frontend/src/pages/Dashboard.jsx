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
      <section style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '8px 0' }}>Busca vuelos nacionales</h2>
        <SearchBar onResults={setResults} />
      </section>

      {results ? (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: '8px 0' }}>Resultados</h3>
            <button className="btn-outline" onClick={() => setResults(null)}>Limpiar</button>
          </div>
          <div className="results">
            {results.map(f => <FlightCard key={f.id} flight={f} />)}
          </div>
        </section>
      ) : (
        <>
          <section style={{ marginTop: 20 }}>
            <h3 style={{ margin: '8px 0' }}>Desde qué precios</h3>
            <div className="grid grid-3">
              {groups.economico.slice(0, 3).map(f => <FlightCard key={f.id} flight={f} />)}
            </div>
          </section>

          <section style={{ marginTop: 20 }}>
            <h3 style={{ margin: '8px 0' }}>Económicos</h3>
            <div className="results">
              {groups.economico.map(f => <FlightCard key={f.id} flight={f} />)}
            </div>
          </section>

          <section style={{ marginTop: 20 }}>
            <h3 style={{ margin: '8px 0' }}>Normales</h3>
            <div className="results">
              {groups.normal.map(f => <FlightCard key={f.id} flight={f} />)}
            </div>
          </section>

          <section style={{ marginTop: 20 }}>
            <h3 style={{ margin: '8px 0' }}>Preferenciales</h3>
            <div className="results">
              {groups.preferencial.map(f => <FlightCard key={f.id} flight={f} />)}
            </div>
          </section>

          <section style={{ marginTop: 20 }}>
            <h3 style={{ margin: '8px 0' }}>Premium / Primera</h3>
            <div className="results">
              {groups.premium.map(f => <FlightCard key={f.id} flight={f} />)}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
