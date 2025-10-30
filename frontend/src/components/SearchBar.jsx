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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
      <div className="form-row form-row-4" style={{ alignItems: 'end' }}>
        <div>
          <div className="label">Origen</div>
          <select value={params.from} onChange={e => update('from', e.target.value)}>
            <option value="">Selecciona ciudad</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="label">Destino</div>
          <select value={params.to} onChange={e => update('to', e.target.value)}>
            <option value="">Selecciona ciudad</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="label">Fecha</div>
          <input className="input" type="date" value={params.date} onChange={e => update('date', e.target.value)} />
        </div>
        <div>
          <div className="label">Pasajeros</div>
          <input className="input" min={1} type="number" value={params.passengers} onChange={e => update('passengers', Number(e.target.value))} />
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn" onClick={search} disabled={loading}>{loading ? 'Buscando...' : 'Buscar vuelos'}</button>
      </div>
    </div>
  )
}
