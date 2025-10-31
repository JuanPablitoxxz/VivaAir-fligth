import React, { useState, useEffect } from 'react'
import Airlines from './admin/Airlines.jsx'
import Cashiers from './admin/Cashiers.jsx'
import Metrics from './admin/Metrics.jsx'

export default function Admin(){
  const [activeTab, setActiveTab] = useState('metrics')
  const [checking, setChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  // Verificar que el usuario sea ADM, si no, redirigir
  useEffect(() => {
    const checkRole = () => {
      try {
        const rawSession = localStorage.getItem('vivaair.session')
        let currentSession = null
        if (rawSession) {
          try {
            currentSession = JSON.parse(rawSession)
          } catch (e) {
            console.error('Error parsing session:', e)
          }
        }
        
        const role = currentSession?.user?.role
        
        if (!role || role !== 'ADM') {
          // Si no es ADM, redirigir
          if (role === 'CAJERO') {
            window.location.replace('/caja')
          } else {
            window.location.replace('/login')
          }
          return
        }
        
        setIsAuthorized(true)
        setChecking(false)
      } catch (err) {
        console.error('Error checking role:', err)
        window.location.replace('/login')
      }
    }
    
    checkRole()
  }, [])
  
  if (checking) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando...</p>
      </div>
    )
  }
  
  if (!isAuthorized) {
    return null
  }

  const tabs = [
    { id: 'metrics', label: 'Métricas' },
    { id: 'airlines', label: 'Aerolíneas' },
    { id: 'cashiers', label: 'Cajeros' }
  ]

  return (
    <div>
      <div style={{ borderBottom: '2px solid var(--muted)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'btn-primary' : 'btn-outline'}
              style={{ 
                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : 'none',
                borderRadius: '8px 8px 0 0',
                marginBottom: '-2px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'metrics' && <Metrics />}
      {activeTab === 'airlines' && <Airlines />}
      {activeTab === 'cashiers' && <Cashiers />}
    </div>
  )
}
