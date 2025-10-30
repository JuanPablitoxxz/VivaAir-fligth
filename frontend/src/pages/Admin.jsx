import React, { useEffect, useState } from 'react'
import { Api } from '../api'

export default function Admin(){
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    Api.adminSummary().then(setSummary).catch(() => setSummary(null))
  }, [])

  if (!summary) return <div className="card">Cargando...</div>

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Resumen</h3>
        <div>Vuelos: <b>{summary.flightsCount}</b></div>
        <div>Ciudades: <b>{summary.citiesCount}</b></div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Usuarios (demo)</h3>
        <div className="results">
          {summary.users.map(u => (
            <div key={u.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{u.name}</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>{u.email}</div>
              </div>
              <div><span className="tag">{u.role}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
