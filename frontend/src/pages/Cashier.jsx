import React, { useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import FlightCard from '../components/FlightCard.jsx'

export default function Cashier(){
  const [results, setResults] = useState([])

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Cajero / Check-in</h3>
        <div style={{ color: '#64748b', fontSize: 14 }}>
          Busca vuelos y realiza la compra en nombre del cliente.
        </div>
      </div>
      <SearchBar onResults={setResults} />
      <div className="results">
        {results.map(f => (
          <div key={f.id} className="card">
            <FlightCard flight={f} />
            <button className="btn" style={{ marginTop: 8 }}>Comprar para cliente</button>
          </div>
        ))}
      </div>
    </div>
  )
}
