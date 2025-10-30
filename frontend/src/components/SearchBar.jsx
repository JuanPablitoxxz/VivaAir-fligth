import React, { useEffect, useState } from 'react'
import { Api } from '../api'

export default function SearchBar({ onResults }) {
  const [cities, setCities] = useState([])
  const [params, setParams] = useState({ from: '', to: '', date: '', passengers: 1 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Api.cities().then(setCities).catch(() => setCities([]))
  }, [])

  const update = (key, value) => setParams(p => ({ ...p, [key]: value }))

  const search = async () => {
    setLoading(true)
    try {
      const res = await Api.searchFlights(params)
      onResults(res)
      window.scrollTo({ top: 600, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="search-container">
      <h2 style={{ color: 'white', margin: '0 0 24px 0', fontSize: '32px', fontWeight: 800 }}>Busca tu vuelo</h2>
      <div className="form-row form-row-4" style={{ alignItems: 'end' }}>
        <div>
          <label className="label" style={{ color: 'rgba(255,255,255,0.9)' }}>Origen</label>
          <select 
            value={params.from} 
            onChange={e => update('from', e.target.value)}
            style={{ background: 'white', color: 'var(--text)' }}
          >
            <option value="">Selecciona ciudad</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" style={{ color: 'rgba(255,255,255,0.9)' }}>Destino</label>
          <select 
            value={params.to} 
            onChange={e => update('to', e.target.value)}
            style={{ background: 'white', color: 'var(--text)' }}
          >
            <option value="">Selecciona ciudad</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" style={{ color: 'rgba(255,255,255,0.9)' }}>Fecha</label>
          <input 
            className="input" 
            type="date" 
            value={params.date} 
            min={minDate}
            onChange={e => update('date', e.target.value)}
            style={{ background: 'white', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label className="label" style={{ color: 'rgba(255,255,255,0.9)' }}>Pasajeros</label>
          <input 
            className="input" 
            min={1} 
            max={9}
            type="number" 
            value={params.passengers} 
            onChange={e => update('passengers', Number(e.target.value))}
            style={{ background: 'white', color: 'var(--text)' }}
          />
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
        <button className="btn" onClick={search} disabled={loading} style={{ minWidth: '200px', fontSize: '18px', padding: '14px 32px' }}>
          {loading ? 'Buscando...' : 'Buscar vuelos'}
        </button>
      </div>
    </div>
  )
}
